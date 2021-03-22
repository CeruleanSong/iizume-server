Sequel.migration do
	change do
		create_or_replace_view(:manga_from_source, "
			SELECT
				t2.*
			FROM
				(SELECT 
					manga.id,
						t1.source_id,
						manga.manga_id,
						t1.alias AS source,
						manga.cover,
						manga.title,
						manga.author,
						manga.artist,
						manga.description,
						manga.type,
						manga.released,
						manga.status_origin,
						manga.status_scan,
						manga.updated
				FROM
					(SELECT 
					source.*,
						source_manga.manga_id,
						source_manga.origin AS source_origin
				FROM
					source
				LEFT JOIN source_manga ON source.id = source_manga.source_id) AS t1
				RIGHT JOIN manga ON t1.manga_id = manga.id) AS t2
			ORDER BY t2.updated DESC
		")
	end

	down do
		dr(:manga_chapter)
	end
end