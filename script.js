// 解析URL中的参数（selectorType：single/multi，key）
function getUrlParams() {
  const params = {};
  window.location.search.slice(1).split('&').forEach(item => {
    const [k, v] = item.split('=');
    params[k] = decodeURIComponent(v);
  });
  return params;
}
const { selectorType = 'single' } = getUrlParams(); // 默认单选

// 加载商品编号JSON并展示
fetch('product-ids.json')
  .then(res => res.json())
  .then(productIds => {
    const list = document.getElementById('productList');
    // 循环生成单选/多选框
    productIds.forEach(id => {
      const item = document.createElement('div');
      item.style.margin = '10px 0';
      // 根据selectorType渲染单选（radio）或多选（checkbox）
      item.innerHTML = `
        <input type="${selectorType === 'single' ? 'radio' : 'checkbox'}" 
               name="products" value="${id}" id="id-${id}">
        <label for="id-${id}" style="margin-left: 8px;">${id}</label>
      `;
      list.appendChild(item);
    });

    // 初始化：获取已选择的商品编号并回显
    ww.getApprovalSelectedItems({
      success: res => {
        const selected = res.data || [];
        selected.forEach(id => {
          const input = document.querySelector(`input[value="${id}"]`);
          if (input) input.checked = true;
        });
      },
      fail: err => console.error('获取已选失败：', err)
    });
  })
  .catch(err => console.error('加载商品编号失败：', err));

// 监听选择变化，保存到企业微信审批
document.addEventListener('change', e => {
  if (e.target.name !== 'products') return;

  // 收集选中的编号
  const selected = [];
  if (selectorType === 'single') {
    // 单选：只取选中的那一个
    const checked = document.querySelector('input[name="products"]:checked');
    if (checked) selected.push(checked.value);
  } else {
    // 多选：取所有选中的
    document.querySelectorAll('input[name="products"]:checked').forEach(input => {
      selected.push(input.value);
    });
  }

  // 调用企业微信接口保存选择
  ww.saveApprovalSelectedItems({
    items: selected,
    success: () => console.log('保存成功：', selected),
    fail: err => console.error('保存失败：', err)
  });
});
