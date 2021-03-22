Sequel.migration do
	change do
		create_or_replace_view(:tags_from_manga, "
			SELECT 
				t1.manga_id, GROUP_CONCAT(tag.name SEPARATOR ', ') as tags
			FROM
				((SELECT 
					manga.manga_id, manga_tag.tag_id
				FROM
					manga
				JOIN manga_tag ON manga.id = manga_tag.manga_id) AS t1)
					JOIN
				tag ON t1.tag_id = tag.id
			GROUP BY t1.manga_id
		")
	end

	down do
		drop(:tags_from_manga)
	end
end