require 'grape'
require_relative 'controller/api.controller'

class Server < Grape::API
	mount Controller::ApiController => '/api'
end