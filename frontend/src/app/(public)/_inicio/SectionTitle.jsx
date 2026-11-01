import parse from 'html-react-parser';

const SectionTitle = ({Title,SubTitle}) => {
    return (
        <div>
            <span className="span">
                <i className="bi bi-fire" style={{ color: '#FF5722', marginRight: '6px', fontSize: '16px', verticalAlign: 'middle' }}></i>
                {parse(SubTitle)}
            </span>
            <h2 className="title tg-element-title">{parse(Title)}</h2>   
        </div>
    );
};

export default SectionTitle;
