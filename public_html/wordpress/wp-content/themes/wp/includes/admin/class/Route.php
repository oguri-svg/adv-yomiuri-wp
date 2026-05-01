<?php

namespace WPTheme\Admin;

class Route
{
    static private $routes = [];


    static public function get($endpoint, $callback, $description = '')
    {
        self::handleRequest('GET', $endpoint, $callback, $description);
    }


    static public function post($endpoint, $callback, $description = '')
    {
        self::handleRequest('POST', $endpoint, $callback, $description);
    }


    static public function handleRequest($method, $endpoint, $callback, $description)
    {
        if (!isset(self::$routes[$method])) self::$routes[$method] = [];
        if (!isset(self::$routes[$method][$endpoint])) self::$routes[$method][$endpoint] = [];

        $callback = is_array($callback) ? $callback : [$callback];
        if (empty($callback) || count($callback) > 2)
            throw new \Exception('Callbackは関数名又はクラス名とメソッド名の配列である必要があります。');

        if (count($callback) === 2 && !class_exists($callback[0]))
            throw new \Exception(str_format('クラス {0} が見つかりません。', $callback[0]));

        if (count($callback) === 2 && !method_exists($callback[0], $callback[1]))
            throw new \Exception(str_format('クラス {0} にメソッド {1} が見つかりません。', $callback[0], $callback[1]));

        $callback = count($callback) === 1 ? ['function' => $callback[0]] : ['class' => $callback[0], 'method' => $callback[1]];

        self::$routes[$method][$endpoint] = [
            'callback'    => $callback,
            'description' => $description
        ];

        add_action('rest_api_init', [self::class, 'registerRoutes']);
    }


    static public function registerRoutes()
    {
        foreach (self::$routes as $method => $routes) {
            if (empty($routes)) continue;

            foreach ($routes as $endpoint => $route) {

                preg_match_all('/\{([^\}]+)\}/', $endpoint, $matches);

                $params = [];
                if (!empty($matches) && !empty($matches[1])) {
                    $params = array_map(fn($m) => [$m => str_format('(?P<{0}>[^/]+)', $m)], $matches[1]);
                }

                if (!empty($params)) $params = array_merge(...$params);
                $endpoint = str_format_assoc($endpoint, $params);

                if (isset($route['callback']['class'])) {
                    $instance           = new $route['callback']['class']();
                    $route['callback']  = [$instance, $route['callback']['method']];
                } else {
                    $route['callback']  = [$route['callback']['function']];
                }

                register_rest_route('api/v1', $endpoint, [
                    'methods'               => $method,
                    'callback'              => $route['callback'],
                    'permission_callback'   => '__return_true'
                ]);
            }
        }

        register_rest_route('api/v1', 'lists', [
            'methods'               => 'GET',
            'callback'              => fn() => self::$routes,
            'permission_callback'   => '__return_true'
        ]);
    }
}
