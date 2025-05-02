<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Artists</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(145deg, #0e0e0e, #1a1a1a);
            color: #fff;
            font-family: 'Montserrat', sans-serif;
            margin: 0;
            padding: 0;
        }

        header {
            text-align: center;
            padding: 40px 20px;
            font-size: 2.5rem;
            font-weight: bold;
            background: #111;
            border-bottom: 2px solid #333;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        }

        .artist-list {
            max-width: 1100px;
            margin: 40px auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 30px;
            padding: 0 20px;
        }

        .artist-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            overflow: hidden;
            text-decoration: none;
            color: inherit;
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .artist-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(255, 255, 255, 0.1);
        }

        .artist-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }

        .artist-info {
            padding: 20px;
        }

        .artist-info h3 {
            margin: 0 0 10px;
            font-size: 1.4rem;
            color: #fff;
        }

        .artist-info p {
            color: #bbb;
            font-size: 0.95rem;
        }

        nav {
            background: #111;
            padding: 15px;
            text-align: center;
        }

        nav a {
            color: #fff;
            margin: 0 15px;
            text-decoration: none;
            font-weight: 500;
        }

        nav a:hover {
            text-decoration: underline;
        }

        footer {
            text-align: center;
            padding: 20px;
            background: #0e0d0d;
            font-size: 0.9rem;
            color: #777;
        }
    </style>
</head>

<body>

    <header>
        Feel the Vibes. Know the Creators
    </header>

    <div class="artist-list">
        <?php
        // Connect to MySQL
        $conn = new mysqli("localhost", "root", "", "my_music_app");

        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        $sql = "SELECT * FROM artists";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            while ($artist = $result->fetch_assoc()) {
                echo "
            <a href='{$artist['profile_link']}' class='artist-card'>
                <img src='{$artist['image']}' alt='{$artist['name']}'>
                <div class='artist-info'>
                    <h3>{$artist['name']}</h3>
                    <p>{$artist['genre']}</p>
                </div>
            </a>
            ";
            }
        } else {
            echo "<p style='text-align:center;'>No artists found.</p>";
        }

        $conn->close();
        ?>
    </div>

    <nav>
        <a href="index.html">Home</a>
        <a href="artists.php">All Artists</a>
    </nav>

    <footer>
        &copy; 2025 Artist Collective. All rights reserved.
    </footer>

</body>

</html>