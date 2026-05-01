<?php

namespace WPTheme\Admin;

class NewApiController
{
    public $post_type = 'news';

    public function __construct()
    {
        // Constructor code
    }

    public function lists($request)
    {
        $limit = $request->get_param('limit') ?? 10;
        $queries = [];

        $datas = getListAll($this->post_type, $limit, $queries, true);
        $datas = array_map(function ($data) {
            return [
                'id'        => $data->ID,
                'title'     => $data->post_title,
                'date'      => $data->post_date,
                'link'      => get_permalink($data->ID),
                'thumbnail' => get_the_post_thumbnail_url($data->ID, 'full') ?: null,
            ];
        }, $datas);

        return ['status' => 'success', 'data' => $datas];
    }

    /**
     * @param $request
     * @return array
     * example: /news/update/{category}/{id}
     * 
     * const data = {
     *     name: "Huy",
     *     email: "huy.nguyenthanh@caters.co.jp"
     * };
     * 
     * fetch('http://localhost:8000/wp-json/api/v1/news/update/asdaq/10', {
     *     method: 'POST',
     *     headers: {
     *         'Content-Type': 'application/json',
     *     },
     *     body: JSON.stringify(data)
     * })
     * .then(response => response.json())
     * .then(result => {
     *    console.log('Success:', result);
     * });
     */
    public function update($request)
    {
        $id = $request->get_param('id');
        $category = $request->get_param('category');
        $name = $request->get_param('name');
        $email = $request->get_param('email');
        $datas = ['id' => $id, 'category' => $category, 'name' => $name, 'email' => $email];

        return ['status' => 'success', 'data' => $datas];
    }
}
