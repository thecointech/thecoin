import React from 'react';


class Request extends React.PureComponent {

    render() {
        const { request } = this.props;
        const requestDate = request ? new Date(request.timestamp).toString() : 0;
        const email = request ? request.email : 'Not Set';
        const cadAmount = request ? request.cadAmount : 'Not Set';
        // Generate the right sub-content depending on which page we're in.
        return (<div>
            <p>
                Email: {email}
            </p>
            <p>
                Date: {requestDate}
            </p>
            <p>
                Amount: {cadAmount}
            </p>
        </div>);
    }
}

export default Request;