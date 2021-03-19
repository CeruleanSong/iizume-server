desc "Run application"
task :run do
  sh "bundle exec puma -p ${PORT:-3000}"
end

desc "Test application"
task :test do
  sh "bundle exec rspec ./spec/spec_helper.rb"
end

task default: :run