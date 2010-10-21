<?php
$apiCall = isset($_GET['apiCall']) ? $_GET['apiCall'] : false;
if (!$apiCall) {
    header("HTTP/1.0 400 Bad Request");
    echo "Failed because apiCall parameter is missing";
    exit();
}

$url = urldecode($apiCall);

// Open the Curl session
$session = curl_init($url);
// Don't return HTTP headers. Do return the contents of the call
curl_setopt($session, CURLOPT_HEADER, false);
curl_setopt($session, CURLOPT_RETURNTRANSFER, true);

// Make the call
$json = curl_exec($session);

// The web service returns XML
header("Content-Type:  application/json");

echo $json;
curl_close($session);

?>