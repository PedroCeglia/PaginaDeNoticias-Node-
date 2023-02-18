const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const bodyParser = require('body-parser')
const fileupload = require('express-fileupload')
const session = require('express-session')
const fs =require('fs')

// Configuração Inicial do Express
const app = express()
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.use('/public', express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, '/pages'))

// Configurando Body Parser ( Formulário )
// Para conseguirmos recuperar JSON a partir de um formuário
app.use(bodyParser.json());
// Para conseguirmos recuperar URLs a partir de um formuário
app.use(bodyParser.urlencoded({ extended: true }));
// Para realizarmos o Up Load de uma Imagem
app.use(fileupload({
    useTempFiles:true,
    tempFileDir: path.join(__dirname, 'temp')
}))
// Use the session middleware // Configurando Sessions para um tempo de 1 minuto
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

const Posts = require("./models/Posts")

// Confiurando MongoDB
mongoose.connect("mongodb+srv://root:7JiWuuNpnkpYkYb1@cluster1.axsk7s3.mongodb.net/Estudo?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log("Conectado com sucesso!")
}).catch((err)=>{
    console.log(err.message)
})

// Lista de Usuarios
let usersList = [
    {login:"Pedro", password:"123456"},
    {login:"Ceglia", password:"654321"},
]

// Rotas

// Home & Busca
app.get('/',(req, res)=>{
    // Verificando aluguma busca
    if(req.query.busca == null){
        // Recuperando todos os Posts
        Posts.find({}).sort({_id: -1}).exec((err, posts)=>{
            posts = posts.map((post)=>{
                return {
                    
                    titulo: post.titulo,
                    image: post.image,
                    subtitulo: post.subtitulo,
                    texto1: post.texto1,
                    texto2: post.texto2,
                    texto3: post.texto3,
                    textointro1: post.textointro1,
                    textointro1: post.textointro2,
                    textocurto: post.textointro1.substr(0,100),
                    slug: post.slug,
                    id: post._id
                }
            })
            if(posts !=  null){
            // Recuperando os 3 Posts Mais Vistos
                Posts.find({}).sort({"views": -1}).limit(6).exec((err, postsTop)=>{
                    postsTop = postsTop.map((postTop)=>{
                        return { 
                            titulo: postTop.titulo,
                            image: postTop.image,
                            subtitulo: postTop.subtitulo,
                            texto1: postTop.texto1,
                            texto2: postTop.texto2,
                            texto3: postTop.texto3,
                            textointro1: postTop.textointro1,
                            textointro1: postTop.textointro2,
                            textocurto: postTop.textointro1.substr(0,70),
                            slug: postTop.slug,
                            views: postTop.views,
                            id: postTop._id
                            
                        }
                    })
                    res.render('home',{posts:posts, postsTop:postsTop})    
                })                
            }
        })
    }else{
        Posts.find({titulo: {$regex: req.query.busca, $options:"i"}},(err, busca)=>{
            busca = busca.map( val =>{
                return {
                    titulo:val.titulo,
                    textocurto:val.textointro1.substr(0,120),
                    image:val.image,
                    slug:val.slug
                }
            })
            res.render("busca",{busca:busca, contagem:busca.length})
        })
    }
})
// Noticia
app.get('/:slug',(req,res)=>{
    if(req.query.busca == null){
        Posts.findOneAndUpdate({slug: req.params.slug}, {$inc : {views:1}}, {new: true},(err, noticia)=>{
            // Get Post List
            if(noticia !=  null){
                // Recuperando os 3 Posts Mais Vistos
                    Posts.find({}).sort({"views": -1}).limit(3).exec((err, postsTop)=>{
                    postsTop = postsTop.map((postTop)=>{
                        return { 
                            titulo: postTop.titulo,
                            image: postTop.image,
                            subtitulo: postTop.subtitulo,
                            texto1: postTop.texto1,
                            texto2: postTop.texto2,
                            texto3: postTop.texto3,
                            textointro1: postTop.textointro1,
                            textointro1: postTop.textointro2,
                            textocurto: postTop.textointro1.substr(0,100),
                            slug: postTop.slug,
                            views: postTop.views
                        }
                    })
                    // Configurando Noticia
                    res.render('noticia',{noticia:noticia, posts:postsTop})
                })                
            } else{
                res.redirect("/")
            }
        })        
    } else{
        Posts.find({titulo: {$regex: req.query.busca, $options:"i"}},(err, busca)=>{
            busca = busca.map( val =>{
                return {
                    titulo:val.titulo,
                    textocurto:val.textointro1.substr(0,120),
                    image:val.image,
                    slug:val.slug
                }
            })
            res.render("busca",{busca:busca, contagem:busca.length})
        })
    }
})

// Admin
app.get('/admin/login', (req,res)=>{
    // Verifica se a session Login ja foi criada
    //if(req.session.login == null){
        // Abrir Pagina de Login
        //res.render("admin-login")
    //}else{
        // Abrir Painel do Admin
        res.redirect("/admin/painel")
    //} 
})
app.get('/admin/painel', (req,res)=>{
       // Verifica se a session Login ja foi criada
    //if(req.session.login == null){
        // Abrir Pagina de Login
        //res.render("admin-login")
        //res.redirect("/admin/login")
    //}else{
        // Abrir Painel do Admin
        Posts.find({}).sort({_id: -1}).exec((err, posts)=>{
            posts = posts.map((post)=>{
                return {
                    
                    titulo: post.titulo,
                    image: post.image,
                    subtitulo: post.subtitulo,
                    texto1: post.texto1,
                    texto2: post.texto2,
                    texto3: post.texto3,
                    textointro1: post.textointro1,
                    textointro1: post.textointro2,
                    textocurto: post.textointro1.substr(0,100),
                    slug: post.slug,
                    id: post._id
                }
            })
            res.render("admin-painel", {posts:posts})
        })
    //} 
})

// Trata Formulario de Login Do Adm
app.post('/admin/login', (req,res)=>{
    usersList.forEach((user)=>{
        if(user.login == req.body.login && user.password == req.body.senha){
            // Logar Usuario
            req.session.login = user.login
        }
    })
    res.redirect("/admin/login")
})

// Tratar Dados Do Formulario DE Cadastro de Noticia
app.post('/admin/noticia/cadastro', (req, res)=>{

    // Tratar Imagem Recebida    
    const arquivo = req.files.arquivo;
    // Recuperar Formato da Imagem
    const formato = arquivo.name.split(".")
    // Verificar se O Formato é Valido
    if(
        formato[formato.length - 1] == 'jpg' ||
        formato[formato.length - 1] == 'png' ||
        formato[formato.length - 1] == 'jpeg'
    ){
        // Criar um Id para a imagem
        let imageName = new Date().getTime()+"." + formato[formato.length - 1]
        // Mover Arquivo Para Pasta Images
        arquivo.mv(__dirname + '/public/images/'+imageName)
    } else{
        // Delete o Arquivo caso o Formato não seje Valido
        fs.unlink(arquivo.tempFilePath)
    }
    
    // Salvar Noticia no Banco de Dados
    const post = req.body;
        
    Posts.create(
        {
            titulo: post.titulo,
            image: post.imagem,
            subtitulo: post.subtitulo,
            texto1: post.textmain1,
            texto2: post.textmain2,
            texto3: post.textmain3,
            textointro1: post.intro1,
            textointro1: post.intro2,
            slug: post.slug
        }
    )
    res.redirect("/admin/login")
})
app.get('/admin/noticia/cadastro', (req, res)=>{
    // Verifica se a session Login ja foi criada
    //if(req.session.login == null){
        // Abrir Pagina de Login
        //res.render("admin-login")
    //}else{
        // Abrir Painel do Admin
        res.render("admin-add-noticia")
    //} 
})

// Editar Noticia
app.get('/admin/noticia/edit/:id',(req,res)=>{
    res.render("admin-edit-noticia")
})

app.get('/admin/noticia/delete/:id',(req,res)=>{
    if(req.params.id != null){
        Posts.deleteOne({_id:req.params.id}).then(()=>{
            res.redirect("/admin/painel")       
        })
    }
})


// Iniciar Servidor
app.listen('3000', ()=>{
    console.log('Aplicação Inicializada')
})