/** 
* 特此声明：Sayho工具箱提供的富文本组件基于TinyMCE开源部分的功能进行二次开发和集成封装
* 富文本 TinyMCE 框架介绍：TinyMCE是一款基于JavaScript的编辑器。它由Moxiecode Systems AB开发，后被Ephox公司收购。
  该编辑器支持文本格式化、插入图片与链接等功能，并可通过插件扩展实现自动图片上传、与MathType集成编辑数学公式等特性。

如需配置更多关于TinyMCE功能的拓展使用，请参考官方文档自行配置。
 * **/ 
/** 
* 函数名：richTextInit 获取富文本实例
* 参数@param ：
    id: 容器ID
    value: 从Sayho工具箱中获取设置好的默认内容
    onInit: 初始化实例回调函数
    onChange: 改变内容回调函数
    language_url: 语言包依赖路径
    skin_url: 主题皮肤依赖路径
    content_css: css样式依赖路径
 * **/ 
function richTextInit(id, value, onInit, onChange,language_url,skin_url,content_css) { 
    return {
        selector: '#' + id,
        language: 'zh_CN',
        language_url: language_url,
        height: 400,
        width: '100%',
        // 插件（按需加载，如需添加请前往TinyMCE官方文档中查看相应配置）
        plugins: 'lists link image table code fullscreen wordcount',
        // 工具栏（按需加载，如需添加请前往TinyMCE官方文档中查看相应配置）
        toolbar: 'undo redo | insertfile |importword exportword exportpdf | suggestededits | revisionhistory | tinymceai-chat tinymceai-review tinymceai-quickactions | blocks fontsizeinput | bold italic | align numlist bullist | link uploadcare uploadcare-video | table math media pageembed | lineheight  outdent indent | strikethrough forecolor backcolor formatpainter removeformat | charmap emoticons checklist | code fullscreen preview | save print | pagebreak anchor codesample footnotes mergetags | addtemplate inserttemplate | addcomment showcomments | ltr rtl casechange | spellcheckdialog a11ycheck',
        // 菜单栏
        menubar: 'file edit view insert format tools table',
        // 隐藏TinyMCE品牌标识
        branding: false,
        promotion: false,
        // 皮肤路径（离线必须）
        skin_url: skin_url,
        content_css: content_css,
        /**
         * 初始化实例回调函数 init_instance_callback
         * 参数：editor 实例
         * 该函数定义如何从Sayho工具箱绑定对应的实体dom元素，并获取到实例对象具体的配置信息
         * ！！！慎重修改 切勿移除！！！
         * **/ 
        init_instance_callback(editor) {
            editor.setContent(value || '');//通过传入value富文本获取到sayho工具箱设置的默认值
            onInit && onInit(editor);  // 通过回调传入实例
        },
        /**
         * 改变内容回调函数 setup
         * 参数：editor 实例
         * 该函数定义如何从Sayho工具箱绑定对应的实体dom元素，并将富文本变动之后的内容传递给Sayho工具箱对应的实体dom元素
         * ！！！慎重修改 切勿移除！！！
         * **/ 
        setup(editor) {
            editor.on('change input', () => {
                onChange && onChange(editor.getContent());  // 通过回调传出富文本的改变内容
            });
        },
        /**
         * file_picker_callback 本地文件上传函数
         * file_picker_types 本地文件上传可选文件类型
         * 假如无此业务需求，请自行移除以下file_picker_callback和file_picker_types参数相关代码行配置
         * **/ 
        file_picker_callback: (callback, value, meta) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.onchange = () => {
                const file = input.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    // 方式1：Base64 直接插入（适合小图）
                    callback(reader.result, { alt: file.name });//若使用方法2自动图片上传，请注释此行代码
                    
                    // 方式2：自动图片上传 先上传到服务器，再返回URL 请自行定义uploadToServer发起后端api接口对接
                    // uploadToServer(file).then(url => callback(url));
                };
                reader.readAsDataURL(file);
            };
            input.click();
        },
        file_picker_types: 'image',//本地文件上传可选文件类型
        /**
         * 如需拓展更多富文本功能或服务，请根据官方文档自行配置
         * .
         * .
         * .
         * .
         * .
         * **/ 

    };
}
/**
 * 函数名：uploadToServer 上传文件到服务器 
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<string>} - 返回上传后的图片URL
 */
function uploadToServer(file) {
    return new Promise((resolve, reject) => {
        const host='https://xxx.com/';//服务器域名站点
        const apiUrl='api/upload';//上传文件到服务器API接口请求地址
        const formData = new FormData();
        formData.append('file', file);
        /**
         * 如需设置额外参数传参或请求头header配置，可通过Sayho前端工具箱状态管理存储的storeConfig 获取相关信息
         * 诸如：token鉴权校验、根据状态管理存储的信息数据判断服务器域名站点等
         * **/ 
        console.log('storeConfig数据信息：',JSON.parse(localStorage.getItem('storeConfig')))
        fetch(host+apiUrl, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(result => {
            // 请根据后端返回结构调整，这里的result.data?.imageUrl || result.imageUrl仅作示例
            if (result.code === 0 || result.success === true) {
                const imageUrl = result.data?.imageUrl || result.imageUrl;
                if (typeof imageUrl !== 'string' || !/^https:\/\//i.test(imageUrl)) {
                    reject(new Error('无效的图片URL'));
                    return;
                }
                resolve(imageUrl);
            } else {
                reject(new Error(result.msg || '上传失败'));
            }
        })
        .catch(error => {
            console.error('上传失败:', error);
            reject(error);
        });
    });
}