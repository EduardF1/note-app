import './App.css';
import 'antd/dist/antd.css'
import {Button, Card, Col, Input, message, Row, Typography} from "antd";

// AWS imports
import Amplify, {API, graphqlOperation} from 'aws-amplify';
import {withAuthenticator} from 'aws-amplify-react';
import aws_exports from './aws-exports'; // specify the location of aws-exports.js file on your project

import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import {Component} from "react";

Amplify.configure(aws_exports);

const {Title} = Typography;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            notes: [],
            value: "",
            displayAdd: true,
            displayUpdate: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        this.notes = this.listNotes();
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    async listNotes() {
        try {
            const notes = await API.graphql(graphqlOperation(queries.listNotes));
            this.setState({notes: notes.data.listNotes.items});
        } catch (err) {
            console.log(err);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        const note = {"note": this.state.value};
        try {
            await API.graphql(graphqlOperation(mutations.createNote, {input: note}));
            message.success('Note added.');
            await this.listNotes();
            this.setState({value: ""});
        } catch (err) {
            console.log(err);
        }
    }

    async handleUpdate(event) {
        event.preventDefault();
        event.stopPropagation();
        const note = {"id": this.state.id, "note": this.state.value};
        try {
            await API.graphql(graphqlOperation(mutations.updateNote, {input: note}));
            this.setState({displayAdd: true, displayUpdate: false, value: ""});
            await this.listNotes();
        } catch (err) {
            console.log(err);
        }
    }

    selectNote(note) {
        this.setState({id: note.id, value: note.note, displayAdd: false, displayUpdate: true});
    }

    async handleDelete(id) {
        const noteId = {"id": id};
        try {
            await API.graphql(graphqlOperation(mutations.deleteNote, {input: noteId}));
            message.success('Note deleted.');
            await this.listNotes();
        } catch (err) {
            console.log(err);
        }
    }

    render() {
        const data = [].concat(this.state.notes)
            .map((item, i) =>
                <Card key={i} onClick={this.selectNote.bind(this, item)}>
                    <Row>
                        <Col span={12}>
                            <span>{item.note}</span>
                        </Col>
                        <Col span={12}>
                            <Button type="primary" onClick={this.handleDelete.bind(this, item.id)}>Delete Note</Button>
                        </Col>
                    </Row>
                </Card>
            );
        return <div>
            <Row>
                <Col span={24}>
                    <Title>Notes</Title>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Input placeholder="Add a new note" value={this.state.value} onChange={this.handleChange}/>
                </Col>
                <Col>
                    {
                        this.state.displayUpdate ?
                            <Button type="primary" onClick={this.handleUpdate.bind(this)}>Update Note</Button> :
                            <Button onClick={this.handleSubmit.bind(this)}>Add Note</Button>
                    }
                </Col>
            </Row>
            <Row>
                <hr/>
                <Col span={24}>
                    {data}
                </Col>
            </Row>
        </div>;
    }
}

export default withAuthenticator(App, {includeGreetings: true});
// export default App;
