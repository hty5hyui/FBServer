class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        footer {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(100, 116, 139, 0.3);
          color: #94a3b8;
          padding: 2rem;
          text-align: center;
          margin-top: 4rem;
        }
        
        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        
        .footer-links a {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        .footer-links a:hover {
          color: #cbd5e1;
        }
        
        .copyright {
          font-size: 0.875rem;
        }
        
        @media (max-width: 768px) {
          .footer-links {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      </style>
      <footer>
        <div class="footer-content">
          <div class="footer-links">
            <a href="/">Главная</a>
            <a href="scripts.html">Скрипты</a>
            <a href="database.html">База данных</a>
            <a href="server.html">Сервер</a>
          </div>
          <div class="copyright">
            © 2024 ScriptMaster Pro Dashboard. Все права защищены.
          </div>
        </div>
      </footer>
    `;
  }
}
