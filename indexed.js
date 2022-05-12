const API = (() => {
    // const baseUrl = 'https://jsonplaceholder.typicode.com';
    const baseUrl = 'http://localhost:3000';
    const path = 'todos';

    const getItems = () =>
        fetch([baseUrl, path].join('/'))
            .then((result) => result.json())

    const deleteTodo = (id) => fetch([baseUrl, path, id].join("/"), {method: "DELETE"});

    const updateTodo = (newtodo, id) =>
		fetch([baseUrl, path, id].join("/"), {
			method: "PUT",
			body: JSON.stringify(newtodo),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		}).then((response) => response.json());

    const addTodo = (newtodo) => 
        fetch([baseUrl, path].join("/"),{
            method: "POST",
            body: JSON.stringify(newtodo),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
        }).then((response) => response.json());
    return {
        getItems,
        updateTodo,
        deleteTodo,
        addTodo
    }
})();

// const {getItems} = API;

// getItems().then((list) => (console.log(list)));

const View = (() => {
    const domstr = { todolist: '#listcontainer', ulList: '#unordered', inputbox: "#newTodoInput" };
    const render = (ele, tmp) => {
        ele.innerHTML = tmp;
    };

    const createBothTmp = (fullList) => {
        let tmp = '';
        let tmpOther = '';

        fullList.forEach((item) => {
            if(item.completed){
                tmp += `
                    <li><span>${item.title}</span><button class="updatebtn ${item.id}">^</button><button class="deletebtn ${item.id}">x</button></li>
                `;
            }
            else{
                tmpOther += `
                    <li><span>${item.title}</span><button class="updatebtn ${item.id}">^</button><button class="deletebtn ${item.id}">x</button></li>
                `;
            }
        })

        return [tmp, tmpOther];

    }

    return {
        render,
        // createTmp,
        // createUnorderTmp,
        createBothTmp,
        domstr
    }
})();

const Model = ((api, view) => {
    const { getItems, updateTodo, deleteTodo, addTodo } = api;
    const {render, createBothTmp, domstr} = view;

    class State {
        #items = [];

        get items(){
            return this.#items;
        }

        set items(newList){
            this.#items = [...newList];

            const ele = document.querySelector(view.domstr.todolist);
            const ele2 = document.querySelector(view.domstr.ulList);

            const [tmp, tmp2] = createBothTmp(this.items); 

            // const tmp = view.createTmp(this.items);
            // const tmp2 = view.createUnorderTmp(this.items);

            view.render(ele, tmp);
            view.render(ele2, tmp2);
            
        }
    }

    return {
        getItems,
        updateTodo,
        deleteTodo,
        addTodo,
        State
    }
})(API, View);

const Controller = ((model, view) => {
    const {getItems, updateTodo, deleteTodo, addTodo, State} = model;

    const state = new State();

    const update = () => {
        /**
         * @todo you must add eventlistener to each updated button
         *       each button has corresponding id that you will use
         *       when calling updated HTTPRequest
         */

        const pendingListEle = document.querySelector(view.domstr.todolist);
        const completedListEle = document.querySelector(view.domstr.ulList);

        pendingListEle.addEventListener("click", (event) => {
            const [type, id] = event.target.className.split(" ");

            if(type === 'updatebtn'){

                updateTodo({
                    userId: 1,
                    id: id,
                    title: ""+event.target.parentElement.children[0].innerHTML,
                    completed: false}, id).then((updatedItem) => {
                        currIndex = state.items.findIndex((obj => obj.id == id));
                        state.items[currIndex] = updatedItem;
                        // console.log('current Index', currIndex);
                        // console.log('item', updatedItem);
                    });
            }

        });
        completedListEle.addEventListener("click", (event) => {
            const [type, id] = event.target.className.split(" ");

            if(type === 'updatebtn'){

                updateTodo({
                    userId: 1, 
                    id: id, 
                    title: ""+event.target.parentElement.children[0].innerHTML, 
                    completed: true}, id).then((updatedItem) => {
                        currIndex = state.items.findIndex((obj => obj.id == id));
                        state.items[currIndex] = updatedItem;
                    });
            }
        });
    };

    const deleteIt = () => {
        /**
         * @todo YOU MUST IMPLEMENT THIS METHOD
         */

         const pendingListEle = document.querySelector(view.domstr.todolist);
         const completedListEle = document.querySelector(view.domstr.ulList);

         pendingListEle.addEventListener("click",(event) => {
             const [type, id] = event.target.className.split(" ");

             if(type === 'deletebtn'){
                state.items = state.items.filter(
                    (todo) => +todo.id !== +event.target.id
                );

                deleteTodo(id).then((result) => {
                    console.log(result);
                });
             }
             
         });

         completedListEle.addEventListener("click",(event) => {
             const [type, id] = event.target.className.split(" ");

             if(type === 'deletebtn'){
                state.items = state.items.filter(
                    (todo) => +todo.id !== +event.target.id
                );

                deleteTodo(id).then((result) => {
                    console.log(result);
                });
             }
             
         });
    };

    const addIt = () => {
        const inputbox = document.querySelector(view.domstr.inputbox);
        inputbox.addEventListener("keyup", (event) => {
            if (event.key === "Enter" && event.target.value.trim() !== ''){
                addTodo({
                    userId: 1, 
                    // id: id, 
                    title: ""+event.target.value, 
                    completed: false}).then(todo => {
                        state.items = [todo, ...state.items];
                    }); 
                    event.target.value = '';
            }
        })
    }

    const init = () => {
        model.getItems().then((newItems) => {
            state.items = newItems;
        })
    };

    const bootstrap = () => {
        init();
        update();
        deleteIt();
        addIt();
    };

    return { bootstrap };

})(Model, View);

Controller.bootstrap();