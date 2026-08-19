Rails.application.routes.draw do
  # Health check endpoint
  get '/health', to: ->(env) { [200, { 'Content-Type' => 'text/plain' }, ['OK']] }

  namespace :api do
    namespace :v1 do
      # User sync route
      post '/users/sync', to: 'users#sync'

      # Profiles CRUD
      resources :profiles, only: [:index, :create, :update, :destroy] do
        # Scan History & Evaluations scoped inside profiles
        resources :scans, only: [:index, :create, :update, :destroy]
      end

      # Product Cache retrieval and registry
      resources :products, param: :barcode, only: [:show, :create]

      # Server-Side Gemini Proxy Operations
      post '/gemini/analyze', to: 'gemini#analyze'
      post '/gemini/recognize', to: 'gemini#recognize'
    end
  end
end
