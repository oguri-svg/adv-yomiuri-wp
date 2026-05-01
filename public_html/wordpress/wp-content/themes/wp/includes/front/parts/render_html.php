<?php

class renderBlock
{
    public $block_list = ['cwc/button', 'cwc/heading', 'cwc/media', 'core/paragraph', 'cwc/table'];
    public $video_brand = ['youtube'];
    public $block_content = '';
    public $block = '';
    public $container;


    public function render($block_content = '', $block = [])
    {
        $this->block_content = $block_content;
        $this->block = $block;
        $this->container = new DOMDocument();

        if ($this->block_content) {
            $content = htmlentities($this->block_content, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            @$this->container->loadHTML('<?xml encoding="UTF-8">' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
            return $this->_render();
        }
    }


    protected function trust_block()
    {
        return !isset($this->block['blockName']) || is_null($this->block['blockName']) || !in_array($this->block['blockName'], $this->block_list, true);
    }


    protected function _render()
    {
        if (true == $is_trust_block = $this->trust_block())
            return $this->block_content;
        $fnc = str_replace(['/', '-'], ['_', '_'], $this->block['blockName']);

        if (!method_exists($this, $fnc))
            return $this->block_content;
        return $this->{$fnc}();
    }


    protected function core_paragraph()
    {
        $isEmpty = trim($this->container->textContent) == '' || $this->container->textContent == '&NewLine;<p><&sol;p>&NewLine;';
        $p = $isEmpty ? '<br/>' : $this->block_content;
        // $p = str_replace(
        //     [
        //         '<p class="has-small-font-size">',
        //         '<p class="has-medium-font-size">',
        //         '<p class="has-large-font-size">',
        //         '<p class="has-x-large-font-size">',
        //     ],
        //     [
        //         '<p class="text-tiny">',
        //         '<p class="text-small">',
        //         '<p class="text-big">',
        //         '<p class="text-huge">'
        //     ],
        //     $p
        // );

        return $p;
    }


    // protected function core_buttons()
    // {
    //     $html   = '';
    //     $a      = $this->container->getElementsByTagName("a");

    //     $flex           = !empty($this->block['attrs']['layout']['justifyContent']) ? $this->block['attrs']['layout']['justifyContent'] : 'left';
    //     $flex_class     = $flex == 'left' ? 'is-flex-start' : '';
    //     $flex_class     = $flex == 'right' ? 'is-flex-end' : $flex_class;

    //     $html .= '<div class="buttons-block ' . $flex_class . '">';
    //     foreach ($a as $i => $button) {

    //         $btn    = $a->item($i);
    //         $href   = $btn->getAttribute('href');
    //         $target = $btn->getAttribute('target') ?: '_self';

    //         $html .= '<a class="btn" href="' . esc_url($href) . '" target="' . $target . '">' . esc_html($button->nodeValue) . '</span><i class="icon icon-arrow"></i></a>';
    //     }
    //     $html .= '</div>';

    //     return $html;
    // }


    // protected function flexible_table_block_table()
    // {
    //     $html = str_replace('<figure class="wp-block-flexible-table-block-table">', '<figure class="wp-block-flexible-table-block-table table">', $this->block_content);
    //     return $html;
    // }


    // protected function core_embed()
    // {
    //     return '<div class="video-block">' . $this->block_content . '</div>';
    // }
}

$renderClass = new renderBlock();
add_filter('render_block', [$renderClass, 'render'], 10, 2);
