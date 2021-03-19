require 'grape'
require_relative 'controller/api.controller'
require_relative 'lib/source/source_list'

Source::SourceList.load_modules

class Server < Grape::API
	mount Controller::ApiController => '/api'
end