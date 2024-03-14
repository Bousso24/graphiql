var apigraph='https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql'


const token = localStorage.getItem("token")
if(token==null) {
    window.location.href = 'index.html';
}
const GraphQL=()=>{
    fetch(apigraph, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                query {
                    user {
                        firstName
                        lastName
                    }
                    transaction(where: {type: {_eq: "xp"}, eventId:{_eq:56}}){
                        amount
                    }
                    projet: transaction( where: {type: { _eq: "xp" }, eventId: { _eq: 56 },path: { _nlike: "/dakar/div-01/checkpoint/%"}}){
                        amount,
                        path
                    }
                    grade: transaction(where: {type: {_eq:"level"},eventId: {_eq: 56}}, order_by: {amount: desc}){
                        amount
                    }
                     up: transaction(where: {type: {_eq:"up"}, path: {_like: "/dakar/div-01/%"}}){
                        amount
                    }
                      down: transaction(where: {type: {_eq:"down"}, path: {_like: "/dakar/div-01/%"}}){
                        amount
                    }
                    fail : audit (where:{grade:{_lt : 1}}, order_by:{createdAt:asc}){
                        createdAt,
                        auditorId,
                        grade 
                    }
                    pass : audit (where:{grade:{_gte : 1}}, order_by:{createdAt:asc}){
                        createdAt,
                        auditorId,
                        grade
                    }
                }
        `})
    })
    .then(response => response.json())
    .then(data => {
        total=0
        data.data.up.forEach(e=>{
            total+=e.amount
        })

        toto=0
        data.data.down.forEach(e=>{
            toto+=e.amount
        })

        result=0 
        data.data.transaction.forEach(element => {
                result+=element.amount
        });
        if (result<1000){
            result=result.toString()+"B"
        }else if (result<1000000){
            result=Math.round(result*0.001).toString()+"KB"
        }else{
            result=Math.round(result*0.0001).toString()+"MB"
        }

        const info_personnelElement = document.getElementById('info_personnel');
        const xpTotalElement = document.getElementById('xpTotal');
        const gradeElement = document.getElementById('grade');
        const ratioElement = document.getElementById('ratio');
        
        info_personnelElement.textContent = `Bienvenue, ${data.data.user[0].firstName} ${data.data.user[0].lastName}`;
        xpTotalElement.textContent = `XP : ${result}`;
        gradeElement.textContent = `${data.data.grade[0].amount}`;
        ratioElement.textContent = `Ratio : ${(total/toto).toFixed(1)}`;

         drawBarChart(data);
         drawPieChart(data);
    })
    .catch(error => {
        console.log("erreur", error);
    });
}
const drawBarChart=(data)=> {
    const graphContainer = document.getElementById('graphContainer');
    graphContainer.innerHTML = ''; 

    // Définissez les dimensions de votre SVG
    const svgWidth = 900;
    const svgHeight = 400;

    let projets=[]
    let pp=[]
    data.data.projet.forEach(e=>{
        let t=e.path.split("/")
        if (t[t.length -1] != "piscine-js-2"){
            projets.push(e.amount)
            pp.push(t[t.length -1])
        }
    })    

    // Calculez la largeur de chaque barre en fonction du nombre de transactions
    const barWidth = 400 / projets.length;

    // Créez un élément SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);

    // Ajoutez les axes X et Y
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", "50");
    yAxis.setAttribute("y1", "20");
    yAxis.setAttribute("x2", "50");
    yAxis.setAttribute("y2", "680");
    yAxis.setAttribute("stroke", "black");
    yAxis.setAttribute("stroke-width", "2");
    svg.appendChild(yAxis);
    
    // Ajoutez les barres
    const totalAmount = projets.reduce((acc, curr) => acc + curr, 0);

    projets.forEach((element, index) => {
        const percentage = (element / totalAmount) * 400;
        const rectHeight = (percentage / 100) * svgHeight;

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", 50 + index * barWidth);
            rect.setAttribute("y", svgHeight - rectHeight);
            rect.setAttribute("width", barWidth);
            rect.setAttribute("height", rectHeight);
            rect.setAttribute("fill", getRandomColor());
            rect.setAttribute("stroke", "black");
            rect.setAttribute("stroke-width", "2");

            if (element < 1000) {
                element = element.toString() + "B";
            } else if (element < 1000000) {
                element = (element * 0.001).toFixed(1).toString() + "KB";
            } else {
                element = Math.round(element * 0.0001).toFixed(1).toString() + "MB";
            }

            rect.addEventListener("mouseover", () => {
                tooltip.textContent = `${pp[index]}: ${element}`;
                tooltip.style.visibility = "visible";
            });
            rect.addEventListener("mouseout", () => {
                tooltip.style.visibility = "hidden";
            });

            svg.appendChild(rect);
    });

    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    document.body.appendChild(tooltip);

    graphContainer.appendChild(svg);
}

// Fonction pour générer une couleur aléatoire au format hexadécimal
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


const drawPieChart = (data) => {
    const pieContainer = document.getElementById('pieContainer');
    pieContainer.innerHTML = ''; 

    // Définissez les dimensions de votre SVG
    const svgWidth = 300;
    const svgHeight = 300;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = Math.min(svgWidth, svgHeight) / 2;

    // Créez un élément SVG pour le diagramme circulaire
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);

    // Calculez le nombre total d'audits
    const totalAudits = data.data.fail.length + data.data.pass.length;

    // Calculez les pourcentages de "fail" et "pass"
    const failPercentage = (data.data.fail.length / totalAudits) * 100;
    const passPercentage = (data.data.pass.length / totalAudits) * 100;

    // Calculez les angles de départ et d'arrêt des sections de cercle
    const startAngleFail = 0;
    const endAngleFail = 360 * (failPercentage / 100); // Cercle entier pour "fail"
    const startAnglePass = endAngleFail;
    const endAnglePass = 360; // Cercle entier pour "pass"

    // Créez les chemins SVG pour les sections de cercle "fail" et "pass"
    const failPath = describeArc(centerX, centerY, radius, startAngleFail, endAngleFail);
    const passPath = describeArc(centerX, centerY, radius, startAnglePass, endAnglePass);

    // Créez les éléments SVG correspondants aux sections de cercle
    const failCircle = document.createElementNS("http://www.w3.org/2000/svg", "path");
    failCircle.setAttribute("d", failPath);
    failCircle.setAttribute("fill", "Chartreuse");
    failCircle.addEventListener("mouseover", () => {
        tool.textContent = `Fail: ${failPercentage.toFixed(2)}%`;
        tool.style.visibility = "visible";
    });
    failCircle.addEventListener("mouseout", () => {
        tool.style.visibility = "hidden";
    });
    svg.appendChild(failCircle);

    const passCircle = document.createElementNS("http://www.w3.org/2000/svg", "path");
    passCircle.setAttribute("d", passPath);
    passCircle.setAttribute("fill", "indigo");
    passCircle.addEventListener("mouseover", () => {
        tool.textContent = `Pass: ${passPercentage.toFixed(2)}%`;
        tool.style.visibility = "visible";
    });
    passCircle.addEventListener("mouseout", () => {
        tool.style.visibility = "hidden";
    });
    svg.appendChild(passCircle);

    pieContainer.appendChild(svg);

    // Définissez une fonction pour créer un chemin SVG décrivant une section de cercle
    function describeArc(x, y, radius, startAngle, endAngle){
        const startRadians = startAngle * Math.PI / 180;
        const endRadians = endAngle * Math.PI / 180;
        const largeArcFlag = endRadians - startRadians <= Math.PI ? "0" : "1";
        const startX = x + radius * Math.cos(startRadians);
        const startY = y + radius * Math.sin(startRadians);
        const endX = x + radius * Math.cos(endRadians);
        const endY = y + radius * Math.sin(endRadians);

        const arcPath = [
            "M", startX, startY,
            "A", radius, radius, 0, largeArcFlag, 1, endX, endY,
            "L", x, y, 
            "Z" 
        ].join(" ");

        return arcPath;
    }
    const tool = document.createElement("div");
    tool.classList.add("tool");
    document.body.appendChild(tool);
}

GraphQL();

