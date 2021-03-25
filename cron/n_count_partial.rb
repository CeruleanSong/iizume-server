#!/usr/bin/env ruby
require 'date'
require 'json'

require_relative '../db/db_connection'
require_relative '../lib/source/source_list'

Source::SourceList.load_module(ARGV[0])
source = Source::SourceList.getSource(ARGV[0])
print source.n_count_partial