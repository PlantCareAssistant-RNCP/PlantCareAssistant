-- Insertion de données dans USER
INSERT INTO USER (username, email, password_hash) VALUES
('johndoe', 'johndoe@example.com', 'hashed_password1'),
('janedoe', 'janedoe@example.com', 'hashed_password2'),
('alice', 'alice@example.com', 'hashed_password3'),
('bob', 'bob@example.com', 'hashed_password4');

-- Insertion de données dans PLANT_TYPE
INSERT INTO PLANT_TYPE (plant_type_name) VALUES
('Succulente'),
('Fleur'),
('Arbre'),
('Herbe Aromatique');

-- Insertion de données dans PLANT
INSERT INTO PLANT (plant_name, user_id, plant_type_id, photo) VALUES
('Aloe Vera', 1, 1, 'aloe_vera.jpg'),
('Rose Rouge', 2, 2, 'rose_rouge.jpg'),
('Chêne', 3, 3, 'chene.jpg'),
('Basilic', 4, 4, 'basilic.jpg');

-- Insertion de données dans POST
INSERT INTO POST (title, content, photo, user_id, plant_id) VALUES
('Ma belle Aloe Vera', 'Voici mon Aloe Vera qui pousse bien !', 'aloe_post.jpg', 1, 1),
('Fleur en pleine floraison', 'Regardez cette rose rouge magnifique.', 'rose_post.jpg', 2, 2),
('Un chêne centenaire', 'Ce chêne est incroyable, il a plus de 100 ans.', 'chene_post.jpg', 3, 3),
('Basilic maison', 'Mon basilic commence à bien pousser, il sent super bon.', 'basilic_post.jpg', 4, 4);

-- Insertion de données dans COMMENT
INSERT INTO COMMENT (content, user_id, post_id, photo) VALUES
('Superbe plante !', 2, 1, NULL),
('Magnifique, j’adore.', 3, 2, NULL),
('Très impressionnant ce chêne !', 4, 3, NULL),
('J’adore le basilic, bravo !', 1, 4, NULL);

-- Insertion de données dans LIKES
INSERT INTO LIKES (post_id, user_id) VALUES
(1, 2),
(2, 3),
(3, 4),
(4, 1);

-- Insertion de données dans USER_PLANT
INSERT INTO USER_PLANT (user_id, plant_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

-- Insertion de données dans USERS_POST (relation N:N)
INSERT INTO USERS_POST (user_id, post_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);
