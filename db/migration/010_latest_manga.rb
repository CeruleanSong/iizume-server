Sequel.migration do
	change do
		create_or_replace_view(:latest_manga, "
			SELECT 
				*
			FROM
				(SELECT 
					source.source_id,
						t1.manga_id,
						t1.cover,
						t1.title,
						MAX(chapter.upload_date) AS upload_date,
						t1.updated
				FROM
					(SELECT 
					manga_chapter.chapter_id, manga.*
				FROM
					manga
				LEFT JOIN manga_chapter ON manga.id = manga_chapter.manga_id) AS t1
				LEFT JOIN chapter ON t1.chapter_id = chapter.id
				LEFT JOIN source_manga ON t1.id = source_manga.manga_id
				LEFT JOIN source ON source_manga.source_id = source.id
				GROUP BY t1.manga_id , source.source_id) AS t2
			ORDER BY t2.upload_date , t2.updated DESC
		")
	end

	down do
		dr(:latest_manga)
	end
end