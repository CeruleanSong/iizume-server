#!/usr/bin/env ruby
require 'sequel'
require 'mysql2'
require 'yaml'

$CONFIG = YAML.load(File.read("db/db_config.yml"))
$CONNECTION_URL = "mysql2://#{$CONFIG['database']['url']}:\
#{$CONFIG['database']['port']}/#{$CONFIG['database']['schema']}"
$CONNECTION_URL_PASSWORD = "mysql2://#{$CONFIG['options']['username']}:#{$CONFIG['options']['password']}@\
#{$CONFIG['database']['url']}:\
#{$CONFIG['database']['port']}/#{$CONFIG['database']['schema']}"

$DB_CONNECTION = Sequel.connect($CONNECTION_URL, $CONFIG['options'])