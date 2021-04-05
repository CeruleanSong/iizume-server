desc "Run application"
task :run do
	sh 'bundle exec puma -p ${PORT:-3000}'
end

desc "Test application"
task :test do
	sh 'bundle exec rspec'
end

namespace :db do
	desc "Configure rom rake support"
	task :migrate do
		require_relative 'db/db_connection'
		sh "sequel -m db/migration #{$CONNECTION_URL_PASSWORD}"
	end
end

task default: :run