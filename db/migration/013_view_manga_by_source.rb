Sequel.migration do
	change do
		create_or_replace_view(:manga_by_source, "
			SELECT 
				source_id,
				T1.manga_id,
				manga.origin,
				manga.cover,
				manga.title,
				manga.partial,
				manga.released,
				manga.updated
			FROM
				(SELECT 
					source.source_id, source_manga.manga_id
				FROM
					source
				JOIN source_manga ON source.source_id = source_manga.source_id) AS T1
					JOIN
				manga ON T1.manga_id = manga.manga_id
		")
	end
end