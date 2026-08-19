module Api
  module V1
    class ProfilesController < BaseController
      before_action :set_profile, only: [:update, :destroy]

      # GET /api/v1/profiles
      def index
        profiles = @current_user.health_profiles.order(created_at: :asc)
        render json: profiles, status: :ok
      end

      # POST /api/v1/profiles
      def create
        profile = @current_user.health_profiles.new(profile_params)
        if profile.save
          render json: profile, status: :created
        else
          render json: { errors: profile.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/profiles/:id
      def update
        if @profile.update(profile_params)
          render json: @profile, status: :ok
        else
          render json: { errors: @profile.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/profiles/:id
      def destroy
        @profile.destroy
        head :no_content
      end

      private

      def set_profile
        @profile = @current_user.health_profiles.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Perfil de saúde não encontrado' }, status: :not_found
      end

      def profile_params
        # Atribui suporte a arrays de condições e alergias
        params.permit(:name, :profile_type, conditions: [], allergies: [])
      end
    end
  end
end
