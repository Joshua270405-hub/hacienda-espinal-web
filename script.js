
const navbar = document.getElementById('navbar');
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
const year = document.getElementById('year');
year.textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

menuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeLightbox = document.getElementById('closeLightbox');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    lightboxImg.src = item.dataset.img;
    lightbox.classList.add('open');
  });
});
closeLightbox.addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) lightbox.classList.remove('open');
});


const testimonialForm = document.getElementById('testimonialForm');
const testimonialList = document.getElementById('testimonialList');
const testimonialStatus = document.getElementById('testimonialStatus');
const testimonialBtn = document.getElementById('testimonialBtn');

const SUPABASE_URL = 'https://jlbefpmnojnrqsmhvgad.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OTFnEf_c4H-PMJCRrrjOMQ_jOPIbzVl';
const TESTIMONIOS_ENDPOINT = `${SUPABASE_URL}/rest/v1/Testimonios`;

function starsFromRating(rating) {
  const number = Number(rating) || 5;
  return '⭐'.repeat(number);
}

function safeText(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

async function loadTestimonials() {
  if (!testimonialList) return;

  try {
    const response = await fetch(`${TESTIMONIOS_ENDPOINT}?select=*&Aprobado=eq.true&order=id.desc`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) throw new Error('No se pudieron cargar los testimonios');

    const testimonials = await response.json();

    if (!testimonials.length) {
      testimonialList.innerHTML = `
        <div class="empty-testimonial">
          <span>🌿</span>
          <p>Aún no hay testimonios publicados. Sé la primera persona en compartir tu experiencia.</p>
        </div>
      `;
      return;
    }

    testimonialList.innerHTML = testimonials.map(t => `
      <article class="testimonial-item">
        <div class="stars">${starsFromRating(t['Calificación'])}</div>
        <p>“${safeText(t.Experiencia)}”</p>
        <strong>${safeText(t.Nombre)}</strong>
        ${t.Fecha ? `<small>${safeText(t.Fecha)}</small>` : ''}
      </article>
    `).join('');

  } catch (error) {
    testimonialList.innerHTML = `
      <div class="empty-testimonial">
        <span>🌿</span>
        <p>No se pudieron cargar los testimonios ahora mismo.</p>
      </div>
    `;
  }
}

async function submitTestimonial(event) {
  event.preventDefault();

  const nombre = document.getElementById('name').value.trim();
  const calificacion = document.getElementById('rating').value;
  const experiencia = document.getElementById('message').value.trim();
  const fecha = document.getElementById('visitDate').value.trim();

  if (!nombre || !experiencia) {
    testimonialStatus.textContent = 'Completa tu nombre y tu experiencia.';
    return;
  }

  testimonialBtn.disabled = true;
  testimonialBtn.textContent = 'Enviando...';
  testimonialStatus.textContent = 'Guardando tu testimonio...';

  try {
    const response = await fetch(TESTIMONIOS_ENDPOINT, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        Nombre: nombre,
        'Calificación': calificacion,
        Experiencia: experiencia,
        Fecha: fecha || new Date().toLocaleDateString('es-DO'),
        Aprobado: true
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    testimonialForm.reset();
    testimonialStatus.textContent = '¡Gracias! Tu testimonio ya fue publicado.';
    await loadTestimonials();

  } catch (error) {
    testimonialStatus.textContent = 'No se pudo enviar. Revisa la conexión o los permisos de Supabase.';
  } finally {
    testimonialBtn.disabled = false;
    testimonialBtn.textContent = 'Enviar testimonio';
  }
}

if (testimonialForm) {
  testimonialForm.addEventListener('submit', submitTestimonial);
}

loadTestimonials();
