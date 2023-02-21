import React from "react";
import { withRouter } from "react-router-dom";
import "sgds-govtech/css/sgds.css";

class Navigation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }

    render() {
        return (
            <>
                <div>
                    <main>
                        <div className="sgds-masthead">
                            <a href="https://www.gov.sg" target="_blank" rel="noopener noreferrer">
                                <span className="sgds-icon sgds-icon-sg-crest"></span>
                                <span className="is-text">A Singapore Government Agency Website</span>
                            </a>
                        </div>

                        {this.props.children}
                    </main>
                </div>

            </>
        );
    }
}

export default withRouter(Navigation);
