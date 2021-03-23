Sequel.migration do
	change do
		create_or_replace_view(:tags_by_manga, "
			SELECT 
				T1.manga_id,
				GROUP_CONCAT(T1.title
					SEPARATOR ', ') AS tags
			FROM
				(SELECT 
					manga.manga_id, manga_tag.tag_id, tag.title
				FROM
					manga
				JOIN manga_tag ON manga.manga_id = manga_tag.manga_id
				JOIN tag ON manga_tag.tag_id = tag.tag_id) AS T1
			GROUP BY T1.manga_id
		")
	end
end