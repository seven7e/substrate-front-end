import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card, Icon, Table } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api } = useSubstrate();
  const { finalized } = props;
  const [blockNumber, setBlockNumber] = useState(0);
  const [blockNumberTimer, setBlockNumberTimer] = useState(0);
  const [blockHash, setBlockHash] = useState(0);
  const [block, setBlock] = useState({});

  const bestNumber = finalized
    ? api.derive.chain.bestNumberFinalized
    : api.derive.chain.bestNumber;


  useEffect(() => {
    let unsubscribeAll = null;

    bestNumber(number => {
        // console.log('number', number)
        setBlockNumber(number.toNumber());
        setBlockNumberTimer(0);
        setBlock({});
      })
      .then(unsub => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [bestNumber]);

  useEffect(() => {
    // console.log('block number', blockNumber);
    api.rpc.chain.getBlockHash(blockNumber)
      .then(blockHash => {
        setBlockHash(blockHash.toHuman());
        return api.rpc.chain.getBlock(blockHash);
      })
      .then(block => {
        setBlock(block);
        // console.log('block', block.toHuman());
        // console.log('block', block.block.header.toHuman());
        // console.log('block hash', block.hash.toHuman());
        // the information for each of the contained extrinsics

        // block.block.extrinsics.forEach((ex, index) => {
        //   // the extrinsics are decoded by the API, human-like view
        //   console.log(index, ex.toHuman());

        //   const { isSigned, meta, method: { args, method, section } } = ex;

        //   // explicit display of name, args & documentation
        //   console.log(`${section}.${method}(${args.map((a) => a.toString()).join(', ')})`);
        //   console.log(meta.documentation.map((d) => d.toString()).join('\n'));

        //   // signer/nonce info
        //   if (isSigned) {
        //     console.log(`signer=${ex.signer.toString()}, nonce=${ex.nonce.toString()}`);
        //   }
        // });
      });
  }, [blockNumber]);

  const timer = () => {
    setBlockNumberTimer(time => time + 1);
  };

  useEffect(() => {
    const id = setInterval(timer, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Grid.Row stretched>
      <Grid.Column width={4}>
        <Card>
          <Card.Content textAlign='center'>
            <Statistic
              label={(finalized ? 'Finalized' : 'Current') + ' Block'}
              value={blockNumber}
            />
          </Card.Content>
          <Card.Content extra>
            <Icon name='time' /> {blockNumberTimer}
          </Card.Content>
        </Card>
      </Grid.Column>
      <Grid.Column width={10}>
        <Card fluid>
          {/* <Card.Description> */}
          <Table celled>
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  Block Hash
                </Table.Cell>
                <Table.Cell>
                  {blockHash}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  Parent Hash
                </Table.Cell>
                <Table.Cell>
                  {block.block && block.block.header.parentHash.toHuman()}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
          {/* </Card.Description> */}
        </Card>
      </Grid.Column>
    </Grid.Row>
  );
}

export default function BlockNumber (props) {
  const { api } = useSubstrate();
  return api.derive &&
    api.derive.chain &&
    api.derive.chain.bestNumber &&
    api.derive.chain.bestNumberFinalized ? (
      <Main {...props} />
    ) : null;
}
