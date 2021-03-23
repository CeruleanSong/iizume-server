Sequel.migration do
	change do
		create_or_replace_view(:chapter_by_manga, "
			SELECT 
				source.source_id, T1.*
			FROM
				(SELECT 
					manga.manga_id,
						chapter.chapter_id,
						chapter.title,
						chapter.chapter_n,
						chapter.scanlator,
						chapter.released
				FROM
					chapter
				JOIN manga_chapter ON chapter.chapter_id = manga_chapter.chapter_id
				JOIN manga ON manga_chapter.manga_id = manga.manga_id) AS T1
					JOIN
				source_manga ON T1.manga_id = source_manga.manga_id
					JOIN
				source ON source_manga.source_id = source.source_id
		")
	end
end