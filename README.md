# Ranger Yelp

`Ranger Yelp` helps people discover and plan visits to real locations in any city.


## Layout Planning:

### Chat Layout:
![Chat Layout](ranger-yelp-layout-planning.jpg)

## Touring Page:
![touring_page](yelp-hackathon-touring-page.jpg)

---
## Database Planning:

### ER Diagram:
<img width="1190" height="748" alt="image" src="https://github.com/user-attachments/assets/4c7b11fb-b00d-4ec3-9253-bd8283ded600" />

### Database Design:
<img width="1462" height="796" alt="supabase-schema-ranger-yelp" src="https://github.com/user-attachments/assets/4acd9d01-711e-4537-a9a7-a80fd5568685" />

### Database Schema:
```SQL
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.itineraries (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  prompt text NOT NULL,
  stops jsonb NOT NULL,
  session_id bigint NOT NULL,
  CONSTRAINT itineraries_pkey PRIMARY KEY (id),
  CONSTRAINT itineraries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT itineraries_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id)
);
CREATE TABLE public.sessions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
```
