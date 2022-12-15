const $tree = document.querySelector('#tree');

// イベント
$tree.addEventListener('click', function (e) {
	e.stopPropagation();
	e.preventDefault();
	const target = e.target;

  // 削除
	if (target.className === 'button-del') {
    if (!confirm('Delete OK ?')) {
      return;
    }
    const id = target.dataset.id;
    chrome.bookmarks.remove(id, () => {
      document.querySelector(`#list-item-${id}`).remove()
    })
		return;
	}

	// リンクを開く
	if (target.nodeName === 'A') {
		chrome.tabs.create({ url: target.href });
		return;
	}

	// リストをオープン
	if (target.nodeName === 'P') {
		const $listItem = document.querySelector(`#list-item-${target.dataset.id}`);
		$listItem.classList.toggle('open');
		return;
	}
});

// 初期化
const init = async function () {
  const tree = await chrome.bookmarks.getTree();

	// ブックマークバーとその他ブックマークが来るのでバーの配列を得る
	const barTree = tree[0].children[0];

	// ツリーを展開
	const $html = createListHtml(barTree.children);
  $tree.innerHTML = '';
	$tree.appendChild($html);
}

const createListHtml = function (children, level = 1) {
	const $ul = document.createElement('ul');
	$ul.className =  `list ${level === 1 ? 'root' : 'children'}`;
	children.forEach(child => {
		const _$li = document.createElement('li');
		_$li.className = 'list-item open';
		_$li.id = `list-item-${child.id}`;
		if (child.children) {
      // フォルダー
      _$li.innerHTML = `<p class="title" data-id="${child.id}">${child.title}</p>`;
		} else {
      // リンク
			_$li.innerHTML = `<a class="title link" data-id="${child.id}" href="${child.url}">${child.title}</a>`;
      _$li.innerHTML += `<a class="button-del" data-id="${child.id}">&times;</a>`
		}
		if (child.children) {
			const $html = createListHtml(child.children, level + 1);
			_$li.appendChild($html);
		}
		$ul.appendChild(_$li);
	});
	return $ul;
};

// 読み込み時
(async function() {
	init();

  // 追加監視
  chrome.bookmarks.onChanged.addListener(() => {
    // pass
  })
})();
