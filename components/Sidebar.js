export class Sidebar {
	constructor(items) {
		this.items = items;
	}

	render() {
		const aside = document.createElement('aside');
		aside.classList.add('sidebar');

		const list = document.createElement('ul');
		list.classList.add('sidebar-list');

		this.items.forEach(item => {
			const li = document.createElement('li');
			li.classList.add('sidebar-item');
			li.textContent = item.label;
			li.dataset.view = item.view;
			list.appendChild(li);
		});

		aside.appendChild(list);
		return aside;
	}
}
