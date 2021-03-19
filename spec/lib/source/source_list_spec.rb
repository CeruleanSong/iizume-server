require_relative '../../../lib/source/source_list'

module Source
	describe SourceList do
		before do
			SourceList.load_modules
		end
		
		describe "source list" do
			it "loaded all the sources correctly" do
				mod = `ls lib/source/modules`
				SourceList.getSourceTypes.each do |source|
					expect(mod.split(' ').length.eql? SourceList.getSourceList.length).to eql(true)
				end
			end
		end
	end
end