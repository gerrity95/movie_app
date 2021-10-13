import json

from bson import ObjectId
from collections import Counter
import pprint


def main():

    with open('test.json') as json_file:
        data = json.load(json_file)

    discover_directors = data['discover_directors']
    discover_genres = data['discover_genres']
    similar_movies = data['similar_movies']
    recommeded_movies = data['recommeded_movies']
    rated_movies = data['rated_movies']
    directors = data['directors']
    genres = data['genres']

    discovered_data = []
    discovered_data.extend(discover_genres)
    discovered_data.extend(discover_directors)
    discovered_data.extend(similar_movies)
    discovered_data.extend(recommeded_movies)

    # REMOVE ALL RATED MOVIES
    existing_ids = []
    for item in rated_movies:
        existing_ids.append(item['movie_id'])

    discovered_data = delete_existing(discovered_data, existing_ids)

    movie_weights = []

    for movie in discovered_data:
        movie_weights.append(movie['id'])

    movie_weights = Counter(movie_weights)
    for key, value in movie_weights.items():
        occurrences = []
        for index, item in enumerate(discovered_data):
            if value > 1 and item['id'] == key:
                occurrences.append(index)
        if occurrences:
            sorted_occurence = sorted(occurrences, reverse=True)
            for i in sorted_occurence:
                if i == sorted_occurence[-1]:
                    pass
                else:
                    del discovered_data[i]

    genre_id_list = []
    for genre in genres:
        g = genre[0].split(',')
        genre_id_list.extend(g)
    genre_id_list = set(genre_id_list)
    print(genre_id_list)
    print(movie_weights)
    for movie in discovered_data:
        for genre in movie['genre_ids']:
            if str(genre) in genre_id_list:
                for key, value in movie_weights.items():
                    if movie['id'] == key:
                        movie_weights[key] += 1
    print(movie_weights)

    for movie in discovered_data:
        rating = movie['vote_average']
        for key, value in movie_weights.items():
            if movie['id'] == key:
                movie_weights[key] += round(rating, 3)

    print(discovered_data[0])


def delete_existing(rec_list, existing_id_list):
    for index, item in enumerate(rec_list):
        if item['id'] in existing_id_list:
            del rec_list[index]
    return rec_list


if __name__ == '__main__':
    main()