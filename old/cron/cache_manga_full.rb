#!/usr/bin/env ruby
require 'date'
require 'json'

require_relative '../db/db_connection'
require_relative '../lib/source/source_list'

Source::SourceList.load_module(ARGV[0])
source = Source::SourceList.getSource(ARGV[0])

partial_manga = $DB.fetch("
		SELECT * FROM manga 
		WHERE partial = true
		LIMIT ?, ?
	",
	Integer(ARGV[1] ? Integer(ARGV[1]) : 0),
	Integer(ARGV[2] ? Integer(ARGV[2]) : 50)
)

source.cache_manga_multiple(partial_manga)