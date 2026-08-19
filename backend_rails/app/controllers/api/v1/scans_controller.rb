module Api
  module V1
    class ScansController < BaseController
      before_action :set_profile
      before_action :set_scan, only: [:update, :destroy]

      # GET /api/v1/profiles/:profile_id/scans
      def index
        scans = @profile.scan_records.order(created_at: :desc)
        render json: scans, status: :ok
      end

      # POST /api/v1/profiles/:profile_id/scans
      def create
        scan = @profile.scan_records.new(scan_params)
        if scan.save
          render json: scan, status: :created
        else
          render json: { errors: scan.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/profiles/:profile_id/scans/:id
      def update
        if @scan.update(scan_params)
          render json: @scan, status: :ok
        else
          render json: { errors: @scan.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/profiles/:profile_id/scans/:id
      def destroy
        @scan.destroy
        head :no_content
      end

      private

      def set_profile
        @profile = @current_user.health_profiles.find(params[:profile_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Perfil de saúde não encontrado' }, status: :not_found
      end

      def set_scan
        @scan = @profile.scan_records.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Registro de escaneamento não encontrado' }, status: :not_found
      end

      def scan_params
        params.permit(:product_name, :status, :reason, :ingredients, :user_rating, :user_comment)
      end
    end
  end
end
