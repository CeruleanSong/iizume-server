#!/usr/bin/env ruby
require 'date'
require 'json'

require_relative '../db/db_connection'
require_relative '../lib/source/source_list'

Source::SourceList.load_module(ARGV[0])
source_list = Source::SourceList.getSourceList
print source_list[ARGV[0]].n_count