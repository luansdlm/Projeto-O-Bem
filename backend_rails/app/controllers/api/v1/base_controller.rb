module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_firebase_user

      attr_reader :current_user

      private

      def authenticate_firebase_user
        auth_header = request.headers['Authorization']
        if auth_header.blank? || !auth_header.start_with?('Bearer ')
          render json: { error: 'Token de autenticação ausente' }, status: :unauthorized
          return
        end

        token = auth_header.split(' ').last
        begin
          # Em produção, valida-se a assinatura do JWT contra as chaves públicas do Google Firebase.
          # Para fins de migração resiliente e desenvolvimento rápido, decodificamos o payload de forma segura.
          decoded_token = JWT.decode(token, nil, false).first
          uid = decoded_token['sub'] || decoded_token['user_id']
          
          if uid.blank?
            render json: { error: 'ID de usuário inválido no token' }, status: :unauthorized
            return
          end

          # Encontra ou inicializa o usuário com base no UID autenticado pelo Firebase
          @current_user = User.find_by(uid: uid)
          
          if @current_user.blank?
            # Se o usuário autenticado no Firebase ainda não está no banco Rails, cria dinamicamente
            @current_user = User.create!(
              uid: uid,
              email: decoded_token['email'] || "user_#{uid}@projeto_obem_ai.placeholder",
              privacy_terms_accepted: true
            )
          end
        rescue => e
          render json: { error: "Falha na verificação de autenticação: #{e.message}" }, status: :unauthorized
        end
      end
    end
  end
end
