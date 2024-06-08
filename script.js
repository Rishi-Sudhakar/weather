$(document).ready(function(){
    const initialBackground = 'worldmap.svg';
    const snowBackground = 'snow.svg';
    const cloudyBackground = 'cloudy.svg';
    const animatedBackground = 'animatedshape.svg';

    // Function to set the background image
    function setBackground(image) {
        $('#background-animation').css('background-image', 'url(' + image + ')');
    }

    // Initial background on page load
    setBackground(initialBackground);

    // Set the background to animatedshape.svg on page reload
    $(window).on('load', function() {
        setBackground(animatedBackground);
    });

    $('#search').click(function(){
        var city = $('#city').val();
        if(city === "") {
            alert("Please enter a city name.");
            return;
        }
        
        $('#loader').removeClass('hidden');
        $('#weather-data').addClass('hidden');
        
        var geocodingUrl = 'https://nominatim.openstreetmap.org/search?format=json&q=' + city;

        $.ajax({
            url: geocodingUrl,
            type: 'GET',
            dataType: 'json',
            success: function(data){
                if(data.length > 0) {
                    var location = data[0];
                    var latitude = location.lat;
                    var longitude = location.lon;
                    var weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto';

                    $.ajax({
                        url: weatherUrl,
                        type: 'GET',
                        dataType: 'json',
                        success: function(weatherData){
                            var temperature = weatherData.current_weather.temperature;
                            var windSpeed = weatherData.current_weather.windspeed;
                            var humidity = weatherData.hourly.relative_humidity_2m[0];

                            // Change background based on temperature
                            if (temperature < 30) {
                                setBackground(snowBackground);
                            } else {
                                setBackground(cloudyBackground);
                            }

                            $('#city-name').text('Weather in ' + city);
                            $('#temperature').html('<i class="fas fa-thermometer-half"></i> ' + temperature + '°C');
                            $('#wind-speed').html('<i class="fas fa-wind"></i> ' + windSpeed + ' m/s');
                            $('#humidity').html('<i class="fas fa-tint"></i> ' + humidity + '%');
                            
                            var hourlyForecastHtml = '';
                            for(var i = 0; i < 6; i++) {
                                hourlyForecastHtml += '<div class="hourly-forecast-item tooltip">';
                                hourlyForecastHtml += '<p>' + weatherData.hourly.time[i].substring(11, 16) + '</p>';
                                hourlyForecastHtml += '<p><i class="fas fa-thermometer-half"></i> ' + weatherData.hourly.temperature_2m[i] + '°C</p>';
                                hourlyForecastHtml += '<p><i class="fas fa-wind"></i> ' + weatherData.hourly.wind_speed_10m[i] + ' m/s</p>';
                                hourlyForecastHtml += '<span class="tooltiptext">Humidity: ' + weatherData.hourly.relative_humidity_2m[i] + '%</span>';
                                hourlyForecastHtml += '</div>';
                            }
                            $('#hourly-forecast').html(hourlyForecastHtml);

                            var dailyForecastHtml = '';
                            for(var i = 0; i < 5; i++) {
                                dailyForecastHtml += '<div class="daily-forecast-item">';
                                dailyForecastHtml += '<p>' + weatherData.daily.time[i].substring(5, 10) + '</p>';
                                dailyForecastHtml += '<p><i class="fas fa-thermometer-full"></i> ' + weatherData.daily.temperature_2m_max[i] + '°C</p>';
                                dailyForecastHtml += '<p><i class="fas fa-thermometer-empty"></i> ' + weatherData.daily.temperature_2m_min[i] + '°C</p>';
                                dailyForecastHtml += '<p><i class="fas fa-cloud-rain"></i> ' + weatherData.daily.precipitation_sum[i] + 'mm</p>';
                                dailyForecastHtml += '</div>';
                            }
                            $('#daily-forecast').html(dailyForecastHtml);

                            $('#weather-data').removeClass('hidden').hide().fadeIn(1000);
                            $('#loader').addClass('hidden');
                        },
                        error: function(xhr, status, error){
                            $('#weather-data').html('<p>Error fetching weather data</p>').removeClass('hidden').hide().fadeIn(1000);
                            $('#loader').addClass('hidden');
                        }
                    });
                } else {
                    $('#weather-data').html('<p>City not found</p>').removeClass('hidden').hide().fadeIn(1000);
                    $('#loader').addClass('hidden');
                }
            },
            error: function(xhr, status, error){
                $('#weather-data').html('<p>Error fetching geolocation data</p>').removeClass('hidden').hide().fadeIn(1000);
                $('#loader').addClass('hidden');
            }
        });
    });
});
