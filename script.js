// حماية لوحة التحكم بكلمة مرور
const password = prompt("أدخل كلمة المرور للوصول للوحة التحكم:");
if(password !== "1234") {
    alert("كلمة مرور خاطئة!");
    window.location.href = "index.html";
}

const projectForm = document.getElementById('projectForm');
const projectsList = document.getElementById('projectsList');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const exportBtn = document.getElementById('exportBtn');

let projects = [];
let editIndex = null;

// عناصر نافذة المعاينة
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const captionText = document.getElementById("caption");
const spanClose = document.getElementsByClassName("close")[0];

// تحميل المشاريع من localStorage
function loadProjects() {
    const saved = localStorage.getItem('projects');
    if(saved) {
        projects = JSON.parse(saved);
        renderProjects();
    }
}

// حفظ المشاريع
function saveProjects() {
    localStorage.setItem('projects', JSON.stringify(projects));
}

// إضافة أو تعديل مشروع
function addProject(name, desc, img){
    const timestamp = new Date().getTime();
    if(editIndex !== null){
        projects[editIndex] = {name, desc, img, timestamp: projects[editIndex].timestamp};
        editIndex = null;
        projectForm.querySelector('button').textContent = "إضافة مشروع";
        alert("تم تحديث المشروع بنجاح!");
    } else {
        projects.push({name, desc, img, timestamp});
        alert("تم إضافة المشروع بنجاح!");
    }
    saveProjects();
    renderProjects();
}

// حذف مشروع
function deleteProject(index){
    if(confirm("هل أنت متأكد من حذف هذا المشروع؟")){
        projects.splice(index,1);
        saveProjects();
        renderProjects();
    }
}

// تعديل مشروع
function editProject(index){
    const p = projects[index];
    document.getElementById('projectName').value = p.name;
    document.getElementById('projectDesc').value = p.desc;
    document.getElementById('projectImg').value = p.img;
    projectForm.querySelector('button').textContent = "تحديث المشروع";
    editIndex = index;
}

// معاينة الصورة
function previewImage(src, alt){
    modal.style.display = "block";
    modalImg.src = src;
    captionText.innerHTML = alt;
}
spanClose.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; }

// عرض المشاريع
function renderProjects(){
    let filtered = [...projects];

    // فلترة بالبحث
    const query = searchInput.value.toLowerCase();
    if(query){
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query));
    }

    // ترتيب
    const sortVal = sortSelect.value;
    if(sortVal === "newest") filtered.sort((a,b)=>b.timestamp - a.timestamp);
    else if(sortVal === "oldest") filtered.sort((a,b)=>a.timestamp - b.timestamp);
    else if(sortVal === "name-asc") filtered.sort((a,b)=>a.name.localeCompare(b.name));
    else if(sortVal === "name-desc") filtered.sort((a,b)=>b.name.localeCompare(a.name)).reverse();

    projectsList.innerHTML = filtered.map((p,index)=>`
        <div class="project-item">
            <button class="delete-btn delete" onclick="deleteProject(${projects.indexOf(p)})">حذف</button>
            <button class="delete-btn edit" onclick="editProject(${projects.indexOf(p)})">تعديل</button>
            <strong>${p.name}</strong><br>
            ${p.desc}<br>
            <img src="${p.img}" alt="${p.name}" onclick="previewImage('${p.img}','${p.name}')">
        </div>
    `).join('');
}

// تصدير المشاريع
exportBtn.onclick = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.json";
    a.click();
    URL.revokeObjectURL(url);
}

// أحداث الفورم
projectForm.addEventListener('submit', e=>{
    e.preventDefault();
    addProject(
        document.getElementById('projectName').value,
        document.getElementById('projectDesc').value,
        document.getElementById('projectImg').value
    );
    projectForm.reset();
});

// أحداث البحث والترتيب
searchInput.addEventListener('input', renderProjects);
sortSelect.addEventListener('change', renderProjects);

loadProjects();
