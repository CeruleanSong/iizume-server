Sequel.migration do
	change do
		create_or_replace_view(:chapter_from_manga, "
			SELECT t2.* FROM
			(SELECT
				t1.manga_id, chapter.chapter_id, chapter.title, chapter.upload_date,
				chapter.scanlator, chapter.chapter_n, chapter.page_list
				FROM
				(SELECT manga.manga_id, manga_chapter.chapter_id FROM manga
					INNER JOIN manga_chapter
				ON manga.id = manga_chapter.manga_id) as t1
				INNER JOIN chapter
			ON t1.chapter_id = chapter.id) as t2
			ORDER BY t2.chapter_n DESC
		")
	end

	down do
		dr(:manga_chapter)
	end
end