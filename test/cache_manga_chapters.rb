#!/usr/bin/env ruby
require 'date'
require 'json'

require_relative '../db/db_connection'

require_relative '../lib/source/source_list'

Source::SourceList.load_modules

source_list = Source::SourceList.getSourceList

source_list['mangasee'].cache_manga_chapters ARGV[0]