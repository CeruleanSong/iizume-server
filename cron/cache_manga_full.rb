#!/usr/bin/env ruby
require 'date'
require 'json'

require_relative '../db/db_connection'
require_relative '../lib/source/source_list'

Source::SourceList.load_module(ARGV[0])
source = Source::SourceList.getSource(ARGV[0])

partial_manga = $DB[:manga].where(partial: true)
.limit(
	Integer(ARGV[1] ? Integer(ARGV[1]) : 15),
	Integer(ARGV[2] ? Integer(ARGV[2]) : 0)
)

source.cache_manga_multiple(partial_manga)