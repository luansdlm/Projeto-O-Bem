module Api
  module V1
    class ProductsController < BaseController
      skip_before_action :authenticate_firebase_user, only: [:show] # Permite visualizações públicas do cache de barcodes

      # GET /api/v1/products/:barcode
      def show
        product = Product.find_by(barcode: params[:barcode])
        if product
          render json: product, status: :ok
        else
          render json: { error: 'Produto não encontrado na base de dados cache' }, status: :not_found
        end
      end

      # POST /api/v1/products
      def create
        product = Product.find_or_initialize_by(barcode: product_params[:barcode])
        product.assign_attributes(product_params)
        product.last_processed = Time.current

        if product.save
          render json: product, status: :ok
        else
          render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def product_params
        params.permit(:barcode, :name, :brand, :model, :country, :language, :ingredients_text, :ingredients_original, :nutritional_info)
      end
    end
  end
end
