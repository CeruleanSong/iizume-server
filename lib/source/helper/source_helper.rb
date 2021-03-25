module Helper
	module Source
		def Source.get_latest(page, limit)
			return $DB.fetch("
				SELECT 
					source_id,
					manga_id,
					chapter_id,
					chapter_n,
					title,
					cover,
					MAX(T3.released) AS released,
					updated
				FROM
					(SELECT 
						T2.*, source.source_id
					FROM
						(SELECT 
						T1.*, manga.title, manga.cover
					FROM
						(SELECT 
						manga_chapter.manga_id,
							chapter.chapter_id,
							chapter_n,
							released,
							updated
					FROM
						chapter
					LEFT JOIN manga_chapter ON chapter.chapter_id = manga_chapter.chapter_id) AS T1
					LEFT JOIN manga ON T1.manga_id = manga.manga_id) AS T2
					LEFT JOIN source_manga ON T2.manga_id = source_manga.manga_id
					LEFT JOIN `source` ON source_manga.source_id = source.source_id) AS T3
				GROUP BY manga_id , chapter_id
				ORDER BY T3.released , T3.updated DESC
				LIMIT ? OFFSET ?
			", limit, page*limit)
			
		end
	end
end