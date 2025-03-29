const apiKey = 'AIzaSyCe45bkuE2NaYhaFJBQ-_coFR8RoH7xrGw'; // YouTube API key
        const channelId = 'UChRUnDg7MbSeG4HZPt5-tyQ'; // YouTube Channel ID
        const fallbackVideoURL = "https://www.youtube.com/embed/KkPqr2lx7t8?si=JBSxuVC_3TnWqWXy"; // Your fallback video

        async function fetchLatestVideo() {
            const iframe = document.getElementById('latestVideo');
            const placeholder = document.getElementById('videoPlaceholder');
            const descriptionBox = document.getElementById('videoDescription');

            try {
                const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                const videoIds = data.items.map(item => item.id.videoId).filter(Boolean);
                if (videoIds.length === 0) throw new Error('No videos found');

                const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds.join(',')}&part=contentDetails,status`;
                const videosResponse = await fetch(detailsUrl);
                const videosData = await videosResponse.json();

                const videoOver1Min = videosData.items.find(item => {
                    const duration = item.contentDetails.duration;
                    const embeddable = item.status?.embeddable;

                    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
                    const minutes = match && match[1] ? parseInt(match[1]) : 0;
                    const seconds = match && match[2] ? parseInt(match[2]) : 0;

                    return (minutes * 60 + seconds) > 60 && embeddable;
                });

                if (!videoOver1Min) throw new Error('No embeddable, long enough video found');

                const latestVideoId = videoOver1Min.id;
                const description = data.items.find(item => item.id.videoId === latestVideoId)?.snippet?.description;

                iframe.src = `https://www.youtube.com/embed/${latestVideoId}?autoplay=1&mute=1&rel=0`;
                iframe.onerror = () => {
                    console.warn("Iframe load error — reverting to fallback.");
                    iframe.src = fallbackVideoURL;
                    descriptionBox.textContent = "Fallback video due to embed restriction.";
                };

                descriptionBox.textContent = description || '';
                iframe.style.display = 'block';
                placeholder.style.display = 'none';

            } catch (error) {
                console.warn("Falling back to backup video:", error);
                const iframe = document.getElementById('latestVideo');
                const placeholder = document.getElementById('videoPlaceholder');
                const descriptionBox = document.getElementById('videoDescription');

                iframe.src = fallbackVideoURL;
                iframe.style.display = 'block';
                placeholder.style.display = 'none';
                descriptionBox.textContent = "Enjoy this video on one of our favorite shows, 'Over The Garden Wall'. Stay tuned for our first release! ";
            }
        }

        // Run when the page loads
        window.addEventListener('load', fetchLatestVideo);

        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const mobileNav = document.getElementById('mobileNav');
        const overlay = document.getElementById('overlay');

        function closeNav() {
            hamburgerBtn.classList.remove('open');
            mobileNav.classList.remove('open');
            overlay.classList.remove('overlay-active');
            document.body.classList.remove('blurred');
        }


        hamburgerBtn.addEventListener('click', () => {
            const isOpen = mobileNav.classList.contains('open');
            if (isOpen) {
                closeNav();
                document.body.classList.remove('blurred');
            } else {
                hamburgerBtn.classList.add('open');
                mobileNav.classList.add('open');
                overlay.classList.add('overlay-active');
                document.body.classList.add('blurred');
            }
        });


        overlay.addEventListener('click', closeNav);

        // --- Profile arrows functionality ---
        const scrollContainer = document.querySelector('.creative-profiles-container');
        const scrollLeftBtn = document.getElementById('scrollLeft');
        const scrollRightBtn = document.getElementById('scrollRight');
        const scrollAmount = 600; // More powerful scroll

        const checkScrollButtons = () => {
            const scrollLeft = scrollContainer.scrollLeft;
            const scrollWidth = scrollContainer.scrollWidth;
            const containerWidth = scrollContainer.clientWidth;

            // Disable LEFT if at start
            if (scrollLeft <= 0) {
                scrollLeftBtn.disabled = true;
            } else {
                scrollLeftBtn.disabled = false;
            }

            // Disable RIGHT if at end
            if (scrollLeft + containerWidth >= scrollWidth - 1) {
                scrollRightBtn.disabled = true;
            } else {
                scrollRightBtn.disabled = false;
            }
        };

        scrollLeftBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        scrollRightBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        scrollContainer.addEventListener('scroll', checkScrollButtons);

        // Initial check
        window.addEventListener('load', checkScrollButtons);

        // TIME DISPLAY
        function updateTime() {
            const timeElement = document.getElementById('currentTime');
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        setInterval(updateTime, 1000);
        updateTime();

        // WEATHER DISPLAY (Fahrenheit + Simple Conditions)
        async function fetchWeather() {
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.4187&longitude=-74.3656&current_weather=true&temperature_unit=fahrenheit');
                const data = await response.json();

                const temp = Math.round(data.current_weather.temperature);
                const code = data.current_weather.weathercode;

                // Simple condition mapping from weather code to description
                const weatherConditions = {
                    0: "Clear",
                    1: "Mainly Clear",
                    2: "Partly Cloudy",
                    3: "Cloudy",
                    45: "Fog",
                    48: "Fog",
                    51: "Light Drizzle",
                    53: "Drizzle",
                    55: "Heavy Drizzle",
                    56: "Freezing Drizzle",
                    57: "Freezing Drizzle",
                    61: "Light Rain",
                    63: "Rain",
                    65: "Heavy Rain",
                    66: "Freezing Rain",
                    67: "Freezing Rain",
                    71: "Light Snow",
                    73: "Snow",
                    75: "Heavy Snow",
                    77: "Snow Grains",
                    80: "Rain Showers",
                    81: "Rain Showers",
                    82: "Heavy Rain Showers",
                    85: "Snow Showers",
                    86: "Heavy Snow Showers",
                    95: "Thunderstorm",
                    96: "Thunderstorm",
                    99: "Severe Thunderstorm"
                };

                const condition = weatherConditions[code] || "Unknown";
                document.getElementById('weather').textContent = `${temp}ºF and ${condition}`;
            } catch (e) {
                document.getElementById('weather').textContent = 'Weather unavailable';
            }
        }

        fetchWeather();

        const creativePill = document.querySelector('.creative-pill');

        creativePill.addEventListener('click', () => {
            creativePill.classList.add('active');
        });

        // Remove active state when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!creativePill.contains(e.target)) {
                creativePill.classList.remove('active');
            }
        });

        const blackBGSections = document.querySelectorAll('.blackBG');
        const hamburger = document.getElementById('hamburgerBtn');

        if (blackBGSections.length > 0 && hamburger) {
            const observer = new IntersectionObserver(
                (entries) => {
                    const isBlackVisible = entries.some(entry => entry.isIntersecting);
                    if (isBlackVisible) {
                        hamburger.classList.remove('black'); // white hamburger
                    } else {
                        hamburger.classList.add('black'); // black hamburger
                    }
                },
                {
                    root: null,
                    threshold: 0.01
                }
            );

            blackBGSections.forEach(section => observer.observe(section));
        }
        document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const dropdown = trigger.nextElementSibling;
                dropdown.classList.toggle('open');
            });
        });

        document.getElementById('overlay').addEventListener('click', () => {
            document.querySelectorAll('.dropdown-items').forEach(drop => {
                drop.classList.remove('open');
            });
        });

        document.querySelectorAll('.desktop-dropdown-trigger').forEach(trigger => {
            trigger.addEventListener('click', function (e) {
                e.preventDefault();

                // Close all open dropdowns
                document.querySelectorAll('.desktop-dropdown').forEach(drop => {
                    if (drop !== this.nextElementSibling) {
                        drop.style.display = 'none';
                    }
                });

                // Toggle this one
                const dropdown = this.nextElementSibling;
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            });
        });


        // Close dropdowns when clicking elsewhere
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.dropdown-parent')) {
                document.querySelectorAll('.desktop-dropdown').forEach(drop => drop.style.display = 'none');
            }
        });

        const heroImg = document.querySelector('.hero-img');
        let isWhiteLogo = true;

        heroImg.addEventListener('click', () => {
            isWhiteLogo = !isWhiteLogo;
            heroImg.src = isWhiteLogo
                ? 'images/sokkoWordmarkWhite.svg'
                : 'images/sokkoWordmarkBlack.svg';
        });
