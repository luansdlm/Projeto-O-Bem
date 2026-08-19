module Api
  module V1
    class UsersController < BaseController
      # POST /api/v1/users/sync
      def sync
        user_params = params.require(:user).permit(:uid, :email, :privacy_terms_accepted, :full_name, :phone, :alternative_email)
        
        # Garante a sincronia de contas
        user = User.find_or_initialize_by(uid: @current_user.uid)
        user.assign_attributes(
          email: user_params[:email] || user.email,
          privacy_terms_accepted: user_params[:privacy_terms_accepted] != false,
          full_name: user_params[:full_name] || user.full_name,
          phone: user_params[:phone] || user.phone,
          alternative_email: user_params[:alternative_email] || user.alternative_email
        )

        if user.save
          render json: user, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end
