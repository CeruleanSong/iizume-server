#!/usr/bin/env ruby
require 'date'
require 'json'

require_relative '../db/db_connection'
require_relative '../lib/source/source_list'

Source::SourceList.load_module(ARGV[0])
source_list = Source::SourceList.getSourceList
source_list[ARGV[0]].cache_all(
	Integer(ARGV[1] ? Integer(ARGV[1]) : 0),
	Integer(ARGV[2] ? Integer(ARGV[2]) : 0)
)