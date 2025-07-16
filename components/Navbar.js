export class Navbar {
	constructor(appName) {
		this.appName = appName;
		this.logoSrc = 'logo.png';
	}

	render() {
		const header = document.createElement('header');
		header.classList.add('navbar');

		const logoImg = document.createElement('img');
		logoImg.classList.add('navbar-logo');
		logoImg.src = this.logoSrc;
		logoImg.alt = `${this.appName} logo`;
		header.appendChild(logoImg);

		const appNameDiv = document.createElement('div');
		appNameDiv.classList.add('navbar-appName');
		appNameDiv.textContent = this.appName;
		header.appendChild(appNameDiv);

		const navMenu = document.createElement('nav');
		navMenu.classList.add('navbar-menu');
		header.appendChild(navMenu);

		return header;
	}
}