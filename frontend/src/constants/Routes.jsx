import React, { Component } from "react";
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom'
import Navigation from "../views/components/Navigation";
import HomePage from "../views/pages/HomePage";
import ResultPage from "../views/pages/ResultPage";
import HelpPage from "../views/pages/HelpPage";
import ErrorPage from "../views/pages/ErrorPage";


export default class Routes extends Component {
    render() {
        return (
            <>
                <Router>
                    <Navigation>
                        <Switch>
                            <Route exact path="/" component={HomePage} />
                            <Route exact path="/home" component={HomePage} />
                            <Route exact path="/result" component={ResultPage} />
                            <Route exact path="/about" component={HelpPage} />
                            <Route exact path="/error" component={ErrorPage} />
                        </Switch>
                    </Navigation>
                </Router>
            </>
        );
    }
}
