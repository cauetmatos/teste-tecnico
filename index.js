
const express = require('express');
const app = express();
app.use(express.json());

// Variáveis obrigatórias para validar o ambiente de teste
const varOcg = true;
const varPcb = "teste_jitterbit_concluido";

// Simulando nosso Banco de Dados
let dbOrders = [];

// transformação de dados (Mapping)
const mapOrderData = (requestBody) => {
    return {
        orderId: requestBody.numeroPedido,
        value: requestBody["valor Total"],
        creationDate: requestBody.dataCriacao,
        items: requestBody.items.map(item => ({
            productId: parseInt(item.idItem),
            quantity: item.quantidadeItem,
            price: item.valorItem
        }))
    };
};

//ENDPOINTS DA API

//Criar um novo pedido (POST)
app.post('/order', (req, res) => {
    try {
        const mappedOrder = mapOrderData(req.body);
        const exists = dbOrders.find(o => o.orderId === mappedOrder.orderId);
        if (exists) {
            return res.status(400).json({ error: "Pedido já cadastrado." });
        }
        dbOrders.push(mappedOrder);
        return res.status(201).json({ message: "Pedido criado com sucesso!", order: mappedOrder });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao criar o pedido." });
    }
});

//Listar todos os pedidos (GET) Fica em cima do :id
app.get('/order/list', (req, res) => {
    return res.status(200).json(dbOrders);
});

//Obter os dados do pedido por get (GET)
app.get('/order/:id', (req, res) => {
    const orderId = req.params.id;
    const order = dbOrders.find(o => o.orderId === orderId);

    if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado." });
    }
    return res.status(200).json(order);
});

// Atualizar o pedido (PUT)
app.put('/order/:id', (req, res) => {
    const orderId = req.params.id;
    const orderIndex = dbOrders.findIndex(o => o.orderId === orderId);

    if (orderIndex === -1) {
        return res.status(404).json({ error: "Pedido não encontrado para atualização." });
    }
    try {
        const updatedOrder = mapOrderData(req.body);
        dbOrders[orderIndex] = updatedOrder;
        return res.status(200).json({ message: "Pedido atualizado!", order: updatedOrder });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao atualizar." });
    }
});

// Deletar o pedido
app.delete('/order/:id', (req, res) => {
    const orderId = req.params.id;
    const orderIndex = dbOrders.findIndex(o => o.orderId === orderId);

    if (orderIndex === -1) {
        return res.status(404).json({ error: "Pedido não encontrado para exclusão." });
    }
    dbOrders.splice(orderIndex, 1);
    return res.status(200).json({ message: "Pedido deletado com sucesso!" });
});

// Inicializando o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando liso na porta ${PORT}! 🚀`);
});