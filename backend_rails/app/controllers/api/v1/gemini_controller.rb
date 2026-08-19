module Api
  module V1
    class GeminiController < BaseController
      # POST /api/v1/gemini/recognize
      def recognize
        image_base64 = params[:image_base64]
        if image_base64.blank?
          render json: { error: 'Imagem base64 ausente' }, status: :bad_request
          return
        end

        prompt = <<~PROMPT
          Atue como um sistema OCR e identificador visual inteligente de embalagens de produtos.
          Você deve se limitar a reconhecer produtos alimentícios (comidas, bebidas), medicamentos (remédios, suplementos) e produtos de beleza/farmácia/maquiagens (shampoo, esmaltes, sabonetes, protetores, cremes).
          Estes são os únicos consumíveis ou tópicos de saúde suportados pelo aplicativo.

          Analise a imagem da embalagem ou rótulo do produto e responda EXCLUSIVAMENTE em formato JSON.
          Se o produto na imagem NÃO for de uma dessas categorias (por exemplo: for um livro, eletrônico, móvel, peça de carro, roupa, etc.), defina "isSupportedCategory" como false. Caso contrário, defina como true.

          Responda EXCLUSIVAMENTE em formato JSON puro, seguindo este esquema exato de JSON:
          {
            "barcode": "número do código de barras ou string vazia se não ler nenhum",
            "productName": "nome do produto ou string vazia se não identificar",
            "brand": "marca fabricante ou string vazia se não identificar",
            "isSupportedCategory": true ou false
          }
        PROMPT

        begin
          result = call_gemini_api(image_base64, prompt)
          render json: result, status: :ok
        rescue => e
          render json: { error: "Erro na análise de reconhecimento: #{e.message}" }, status: :internal_server_error
        end
      end

      # POST /api/v1/gemini/analyze
      def analyze
        image_base64 = params[:image_base64]
        profile_params = params[:profile] || {}

        if image_base64.blank?
          render json: { error: 'Imagem base64 ausente' }, status: :bad_request
          return
        end

        name = profile_params[:name] || "Perfil Ativo"
        conditions = profile_params[:conditions] || []
        allergies = profile_params[:allergies] || []

        has_no_restrictions = conditions.empty? && allergies.empty?

        prompt = <<~PROMPT
          Atue como um especialista em alergias alimentares, farmacológicas, dermatológicas e tradução técnica de rótulos de produtos de consumo de saúde e beleza.
          
          IMPORTANTE: O aplicativo é STRICTLY LIMITADO a analisar:
          1. Produtos alimentícios (comidas, bebidas, ingredientes culinários).
          2. Medicamentos (remédios, fórmulas farmacêuticas, suplementos).
          3. Produtos de beleza/farmácia/maquiagens (cosméticos, sabonetes, xampus, maquiagens e produtos aplicados na pele ou cabelos).

          Se o produto na imagem for qualquer outra coisa (por exemplo: aparelhos eletrônicos, ferramentas, calçados, livros, brinquedos, móveis, etc.) que não seja alimento, medicamento ou cosmético, você deve responder com status "yellow", riskCriticality "medium", e reason "Este produto está fora do escopo suportado pelo Projeto OBem AI. O aplicativo analisa apenas alimentos, medicamentos e cosméticos (beleza/farmácia). Por favor, escaneie um rótulo válido."

          PERFIL DO USUÁRIO ATIVO:
          - Título do Perfil: #{name}
          - Condições Clínicas: #{conditions.any? ? conditions.join(', ') : 'Nenhuma condição clínica ativada.'}
          - Alergias Cadastradas: #{allergies.any? ? allergies.join(', ') : 'Nenhuma alergia cadastrada.'}

          #{has_no_restrictions ? '
          AVISO DE RESTRIÇÃO ZERO:
          O perfil do usuário não possui NENHUMA restrição clínica ou alimentar ativada.
          Neste caso, o status de análise DEVE ser obrigatoriamente "green", a riskCriticality deve ser "low" e a reason deve informar expressamente:
          "Nenhuma restrição de saúde ou alergia está configurada no seu perfil ativo. Exibindo informações gerais, ingredientes e a tabela nutricional do produto de forma informativa."
          ' : ''}

          TAREFAS:
          1. Verifique se o produto é um alimento, medicamento ou cosmético. Se não for, emita o aviso de fora do escopo.
          2. Identifique o idioma original do rótulo.
          3. Tente identificar o país de origem da embalagem/escaneamento (ex: "Brasil", "EUA", etc.).
          4. Extraia todos os ingredientes em sua versão original.
          5. Traduza e organize a lista de ingredientes de forma limpa para o Português (Brasil).
          6. Identifique o nome provável do produto, a marca produtora e o modelo/sabor/variante do produto, se visíveis.
          7. Extraia ou resuma da melhor forma possível a tabela ou informação nutricional, se estiver visível (ex: Calorias, Sódio, Açúcares, Gorduras, etc.).
          8. Se houver restrições no perfil, verifique riscos com base nas restrições do usuário (G6PD, açúcar para diabéticos, glúten para celíacos, alergias alimentares ou tópicas específicas no perfil) e alerte de forma correta e proeminente.
          
          REGRAS DE SEMÁFORO (Caso haja restrições no perfil):
          - VERDE: Nenhum ingrediente de risco encontrado.
          - AMARELO: Sem ingredientes de risco direto listados, mas há avisos de "pode conter" potenciais alérgenos relevantes ou ingredientes suspeitos de atenção (como corantes específicos para G6PD que não estão claros ou açúcar elevado para diabéticos).
          - VERMELHO: Algum ingrediente ou traço de risco alto detectado explicitamente relacionado às restrições do perfil.

          RESPOSTA:
          Responda EXCLUSIVAMENTE em formato JSON puro, seguindo este esquema:
          {
            "status": "green" | "yellow" | "red",
            "reason": "Explicação curta e clara do status em Português",
            "identifiedIngredients": ["lista de ingredientes originais"],
            "translatedIngredients": "lista unificada de ingredientes traduzida/limpa em Português",
            "detectedLanguage": "nome do idioma detectado",
            "detectedProductName": "nome do produto",
            "riskCriticality": "high" | "medium" | "low",
            "detectedBrand": "marca fabricante",
            "detectedModel": "modelo, sabor, ou variante do produto",
            "detectedCountry": "país provável do produto",
            "detectedNutritionalInfo": "resumo ou texto das informações de tabela nutricional identificadas"
          }
        PROMPT

        begin
          result = call_gemini_api(image_base64, prompt)
          render json: result, status: :ok
        rescue => e
          render json: { error: "Erro na análise de rótulo: #{e.message}" }, status: :internal_server_error
        end
      end

      private

      def call_gemini_api(image_base64, prompt_text)
        api_key = ENV['GEMINI_API_KEY']
        if api_key.blank?
          raise "A chave GEMINI_API_KEY não foi configurada no Rails backend."
        end

        # Extrai apenas a string base64 se houver metadados (ex: data:image/jpeg;base64,)
        clean_base64 = image_base64.include?(',') ? image_base64.split(',').last : image_base64

        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=#{api_key}"
        
        payload = {
          contents: [
            {
              parts: [
                { text: prompt_text },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: clean_base64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }

        response = HTTParty.post(
          url,
          headers: { 'Content-Type' => 'application/json' },
          body: payload.to_json,
          timeout: 45
        )

        if response.success?
          parsed_resp = JSON.parse(response.body)
          raw_text = parsed_resp.dig('candidates', 0, 'content', 'parts', 0, 'text') || ''
          
          # Limpeza de markdown codeblocks se Gemini retornar formatado
          clean_json = raw_text.gsub(/```json/, '').gsub(/```/, '').strip
          JSON.parse(clean_json)
        else
          raise "Erro HTTP #{response.code} na chamada ao Gemini API: #{response.body}"
        end
      end
    end
  end
end
